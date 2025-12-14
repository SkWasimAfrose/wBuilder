import { Request, Response } from 'express'; // [1]
import Stripe from 'stripe'; // [2]
import { prisma } from '../lib/prisma.js'; // [3]

// Initialize Stripe with the Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string); // [4]

export const stripeWebhook = async (req: Request, res: Response) => { // [1]
    const signature = req.headers['stripe-signature']; // [5]
    
    // Get Webhook Secret from Environment Variables
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string; // [4], [5]

    let event;

    try {
        // Construct the event using the raw body, signature, and secret
        event = stripe.webhooks.constructEvent(
            req.body, 
            signature as string, 
            endpointSecret
        ); // [5]
    } catch (error: any) {
        console.log(`Webhook Error: ${error.message}`);
        res.status(400).send(`Webhook Error: ${error.message}`); // [6]
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded': { // [6]
            const paymentIntent = event.data.object as Stripe.PaymentIntent; // [6]
            
            // Retrieve the session details using the Payment Intent ID
            const sessionList = await stripe.checkout.sessions.list({
                payment_intent: paymentIntent.id
            }); // [6]

            const session = sessionList.data[0]; // [7]

            // Extract metadata stored during session creation
            const { transactionId, appId } = session.metadata as { 
                transactionId: string; 
                appId: string; 
            }; // [7]

            // Verify App ID to ensure the webhook belongs to this application
            if (appId === 'AI Site Builder' && transactionId) { // [7]
                
                // 1. Update Transaction Status in Database
                const transaction = await prisma.transaction.update({
                    where: { id: transactionId },
                    data: { isPaid: true }
                }); // [3]

                // 2. Add Credits to the User's Account
                await prisma.user.update({
                    where: { id: transaction.userId },
                    data: {
                        credits: { increment: transaction.credits }
                    }
                }); // [8]
            }
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`); // [8]
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true }); // [8]
};