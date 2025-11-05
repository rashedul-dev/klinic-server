// import { Request, Response } from 'express';
// import stripe from '../../shared/stripe';
// import { paymentService } from './payment.service';

// const handleWebhook = async (req: Request, res: Response) => {
//   const sig = req.headers['stripe-signature'] as string;
  
//   // Use req.body as Buffer (raw body)
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body, // This should be the raw body
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//   } catch (err:any) {
//     console.log(`❌ Webhook signature verification failed.`, err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   console.log(`✅ Webhook received: ${event.type}`);

//   // Handle the event
//   switch (event.type) {
//     case 'payment_intent.succeeded':
//       const paymentIntent = event.data.object;
//       console.log(`💰 Payment succeeded: ${paymentIntent.id}`);
//       await paymentService.confirmPayment(paymentIntent.id);
//       break;
//     case 'payment_intent.payment_failed':
//       const failedPayment = event.data.object;
//       console.log(`❌ Payment failed: ${failedPayment.id}`);
//       // Handle failed payment
//       await paymentService.handleFailedPayment(failedPayment.id);
//       break;
//     default:
//       console.log(`⚡ Unhandled event type: ${event.type}`);
//   }

//   res.json({ received: true });
// };

// export const webhookController = {
//   handleWebhook,
// };