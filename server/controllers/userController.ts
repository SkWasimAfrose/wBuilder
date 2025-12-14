import { Request, Response } from 'express'; // [1]
import prisma from '../lib/prisma.js'; // [2]
import openai from '../config/openai.js'; // [3]
import Stripe from 'stripe'; // [4]

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string); // [5]

// Placeholder for the System Prompt used in the video
const systemPrompt = `You are an expert frontend React developer. You will always generate modern, responsive, and beautiful websites...`; // [6]

export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id; // [7]

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" }); // [8]
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        }); // [2]

        res.json({ credits: user?.credits || 0 }); // [2]

    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({ message: error.message }); // [9]
    }
};

export const createUserProject = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { initialPrompt } = req.body; // [10]

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        // Check for minimum credits (5 required)
        if (user && user.credits < 5) {
            return res.status(403).json({ message: "Add credit to create more projects" }); // [10]
        }

        // Create Project Entry
        const project = await prisma.websiteProject.create({
            data: {
                name: initialPrompt.length > 50 ? initialPrompt.substring(0, 47) + "..." : initialPrompt, // [11]
                initialPrompt,
                userId
            }
        });

        // Deduct Credits and Update Stats
        await prisma.user.update({
            where: { id: userId },
            data: {
                credits: { decrement: 5 }, // [12]
                totalCreation: { increment: 1 } // [13]
            }
        });

        // Add User Prompt to Conversation
        await prisma.conversation.create({
            data: {
                role: 'user',
                content: initialPrompt,
                projectId: project.id
            }
        }); // [12]

        // 1. Enhance User Prompt via AI
        const promptEnhanceResponse = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-lite-preview-02-05:free", // Note: Model may vary based on source updates (e.g., cat-coder) [14]
            messages: [
                { role: "system", content: systemPrompt }, // [6]
                { role: "user", content: `User Request: ${initialPrompt}` }
            ]
        });

        const enhancedPrompt = promptEnhanceResponse.choices[0].message.content || ""; // [15]

        // Add Enhanced Prompt to Conversation
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `I have enhanced your prompt to: ${enhancedPrompt}`,
                projectId: project.id
            }
        }); // [16]

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "Now generating your website...",
                projectId: project.id
            }
        }); // [16]

        // 2. Generate Website Code via AI
        const codeGenerationResponse = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-lite-preview-02-05:free", // [17]
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: enhancedPrompt }
            ]
        });

        const code = codeGenerationResponse.choices[0].message.content || ""; // [18]

        // Handle generation failure (Refund credits)
        if (!code) {
             await prisma.conversation.create({
                data: {
                    role: 'assistant',
                    content: "Unable to generate the code. Please try again.",
                    projectId: project.id
                }
            });
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } } // Refund [19]
            });
            return res.status(500).json({ message: "Failed to generate code" });
        }

        // Create Version
        const version = await prisma.version.create({
            data: {
                code: code.replace(/```(html|jsx|tsx)?/g, "").replace(/```/g, "").trim(), // Cleanup markdown [18]
                description: "Initial Version",
                projectId: project.id
            }
        });

        // Add Success Message
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I have created your website. You can now preview it and request any changes.",
                projectId: project.id
            }
        }); // [20]

        // Update Project with Code
        await prisma.websiteProject.update({
            where: { id: project.id },
            data: {
                currentCode: version.code,
                currentVersionId: version.id
            }
        }); // [21]

        res.json({ projectId: project.id }); // [22]

    } catch (error: any) {
        console.log(error);
        // Refund on error
        if (req.user?.id) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: { credits: { increment: 5 } } // [21]
            });
        }
        res.status(500).json({ message: error.message });
    }
};

export const getUserProject = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { projectId } = req.params; // [23]

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: {
                conversation: { orderBy: { timestamp: 'asc' } }, // [23]
                versions: { orderBy: { timestamp: 'asc' } }
            }
        });

        if (!project) {
             return res.status(404).json({ message: "Project not found" });
        }

        res.json({ project });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const projects = await prisma.websiteProject.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' } // [24]
        });

        res.json({ projects });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const togglePublish = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { projectId } = req.params; // [25]

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Toggle the status
        const updatedProject = await prisma.websiteProject.update({
            where: { id: projectId },
            data: { isPublished: !project.isPublished } // [25]
        });

        res.json({ 
            message: updatedProject.isPublished 
            ? "Project published successfully" 
            : "Project unpublished" 
        }); // [26]

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

// Plan Configuration [27]
interface Plan {
    credits: number;
    amount: number;
}

const plans: Record<string, Plan> = {
    basic: { credits: 100, amount: 5 },
    pro: { credits: 400, amount: 19 },
    enterprise: { credits: 1000, amount: 49 }
};

export const purchaseCredits = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { planId } = req.body; // [28]

        if (!userId || !plans[planId]) {
            return res.status(400).json({ message: "Invalid plan or user" });
        }

        const plan = plans[planId]; // [28]

        // Create Transaction Record
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                planId,
                amount: plan.amount,
                credits: plan.credits
            }
        }); // [29]

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `AI Site Builder - ${plan.credits} Credits` // [30]
                        },
                        unit_amount: Math.floor(plan.amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.origin}/loading`, // Redirect to loading page to verify webhook [31]
            cancel_url: `${req.headers.origin}/`,
            metadata: {
                transactionId: transaction.id, // [32]
                appId: 'AI Site Builder'
            },
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60) // 30 mins expiry [33]
        });

        res.json({ paymentLink: session.url }); // [33]

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};