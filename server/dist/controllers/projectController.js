import prisma from '../lib/prisma.js'; // [2]
import openai from '../config/openai.js'; // [2]
// Note: The actual prompt text is stored in an assets file in the source video.
// Placeholders are used here where the transcript refers to external assets.
const systemPrompt = `You are an expert frontend React developer. You will always generate modern, responsive, and beautiful websites...`; // [3]
export const makeRevision = async (req, res) => {
    try {
        const { projectId } = req.params; // [2]
        const { message } = req.body; // [2]
        const userId = req.user?.id; // [2]
        // Find User
        const user = await prisma.user.findUnique({
            where: { id: userId }
        }); // [4]
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        } // [4]
        // Check Credits (Requires at least 5)
        if (user.credits < 5) {
            return res.status(403).json({ message: "Add credit to make changes" });
        } // [4], [5]
        // Validate Prompt
        if (!message || message.trim() === '') {
            return res.status(400).json({ message: "Please enter a valid prompt" });
        } // [4]
        // Get Current Project
        const currentProject = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: { versions: true }
        }); // [6]
        if (!currentProject) {
            return res.status(404).json({ message: "Project not found" });
        } // [6]
        // Update Conversation (User Prompt)
        await prisma.conversation.create({
            data: {
                role: 'user',
                content: message,
                projectId
            }
        }); // [7]
        // Deduct Credits
        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        }); // [7]
        // 1. Enhance User Prompt using AI
        const promptEnhanceResponse = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-lite-preview-02-05:free", // Model name updated based on [8] context or similar free model used
            messages: [
                { role: "system", content: systemPrompt }, // [3]
                { role: "user", content: `User Request: ${message}` } // [3]
            ]
        });
        const enhancedPrompt = promptEnhanceResponse.choices[0].message.content || ""; // [3]
        // Add Enhanced Prompt to Conversation
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `I have enhanced your prompt to: ${enhancedPrompt}`,
                projectId
            }
        }); // [9]
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "Now making changes to your website...",
                projectId
            }
        }); // [9]
        // 2. Generate Website Code using AI
        const codeGenerationResponse = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-lite-preview-02-05:free", // [10]
            messages: [
                { role: "system", content: systemPrompt }, // [10]
                {
                    role: "user",
                    content: `Here is the current website code: ${currentProject.currentCode} \n\n User wants this change: ${enhancedPrompt}`
                } // [10]
            ]
        });
        const code = codeGenerationResponse.choices[0].message.content || ""; // [11]
        if (!code) {
            // Handle failure to generate code - refund credits
            await prisma.conversation.create({
                data: {
                    role: 'assistant',
                    content: "Unable to generate the code. Please try again.",
                    projectId
                }
            });
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            });
            return res.status(500).json({ message: "Failed to generate code" });
        } // Logic based on [12]
        // Create New Version
        const version = await prisma.version.create({
            data: {
                code: code.replace(/```(html|jsx|tsx)?/g, "").replace(/```/g, "").trim(), // Cleanup markdown [13]
                description: "Changes made",
                projectId
            }
        }); // [13]
        // Add Completion Message
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I have made the changes to your website. You can now preview it.",
                projectId
            }
        }); // [13]
        // Update Project with New Code
        await prisma.websiteProject.update({
            where: { id: projectId },
            data: {
                currentCode: code.replace(/```(html|jsx|tsx)?/g, "").replace(/```/g, "").trim(),
                currentVersionId: version.id
            }
        }); // [14]
        res.json({ message: "Changes made successfully" }); // [14]
    }
    catch (error) {
        console.log(error);
        // Refund credits on error
        if (req.user?.id) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: { credits: { increment: 5 } }
            });
        } // [15]
        res.status(500).json({ message: error.message });
    }
};
export const rollBackToVersion = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { projectId, versionId } = req.params; // [16]
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        } // [16]
        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: { versions: true }
        }); // [17]
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        } // [17]
        const version = project.versions.find(v => v.id === versionId); // [18]
        if (!version) {
            return res.status(404).json({ message: "Version not found" });
        } // [18]
        // Update Current Code to Version Code
        await prisma.websiteProject.update({
            where: { id: projectId, userId },
            data: {
                currentCode: version.code,
                currentVersionId: version.id
            }
        }); // [18]
        // Add Rollback Message
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I have rolled back your website to the selected version. You can now preview it.",
                projectId
            }
        }); // [19]
        res.json({ message: "Version rolled back" }); // [19]
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}; // [19]
export const deleteProject = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { projectId } = req.params; // [20]
        await prisma.websiteProject.delete({
            where: { id: projectId, userId }
        }); // [21]
        res.json({ message: "Project deleted successfully" }); // [21]
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}; // [21]
export const getProjectPreview = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { projectId } = req.params; // [22]
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        } // [22]
        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId },
            include: { versions: true }
        }); // [22]
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        } // [22]
        res.json({ project }); // [22]
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}; // [23]
export const getPublishedProjects = async (req, res) => {
    try {
        // Public Route - No User ID check required [23]
        const projects = await prisma.websiteProject.findMany({
            where: { isPublished: true },
            include: { user: true },
            orderBy: { updatedAt: 'desc' }
        }); // [23]
        res.json({ projects }); // [24]
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}; // [24]
export const getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params; // [24]
        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId }
        }); // [25]
        // Check if project exists, is published, and has code
        if (!project || !project.isPublished || !project.currentCode) {
            return res.status(404).json({ message: "Project not found" });
        } // [25]
        res.json({ code: project.currentCode }); // [26]
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}; // [26]
export const saveProjectCode = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { projectId } = req.params;
        const { code } = req.body; // [27]
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        } // [27]
        if (!code) {
            return res.status(400).json({ message: "Code is required" });
        } // [27]
        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId }
        }); // [27]
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        } // [28]
        await prisma.websiteProject.update({
            where: { id: projectId },
            data: {
                currentCode: code,
                currentVersionId: "" // Reset version index as this is a manual override [28]
            }
        }); // [28]
        res.json({ message: "Project saved successfully" }); // [28]
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}; // [28]
