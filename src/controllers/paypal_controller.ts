import { Request, Response } from 'express';
import { PayPalService } from '../services/paypal_service';
import { seatController } from './seat_controller';

const paypalService = new PayPalService();

export class PayPalController {

  async webhook(req: Request, res: Response) {
    try {
      const event = req.body;
      console.log('Received PayPal webhook event:', event.event_type);

      if (process.env.NODE_ENV === 'production') {
        const isValid = await paypalService.verifyWebhookSignature(req.headers, JSON.stringify(req.body));
        if (!isValid) {
          return res.status(400).json({ message: 'Invalid webhook signature' });
        }
      }

      switch (event.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          console.log('Payment captured:', event.resource);
          break;
        case 'PAYMENT.CAPTURE.DENIED':
          console.log('Payment denied:', event.resource);
          break;
        case 'PAYMENT.REFUND.COMPLETED':
          console.log('Refund completed:', event.resource);
          break;
        default:
          console.log(`Unhandled event type: ${event.event_type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing failed:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  }

  async paymentSuccess(req: Request, res: Response) {
    try {
      const { token, bookingId } = req.query;
      if (!token || !bookingId) {
        return res.status(400).json({ message: "Missing token or bookingId" });
      }

      const { data, captureId } = await paypalService.capturePayment(token!.toString());
      console.log("Payment successful, captureId:", captureId);

      res.redirect(`fastbuss://payment-success?bookingId=${bookingId}`);
    } catch (error) {
      console.log("Error in payment success", error);
      res.status(500).json({ message: "Error in payment success" });
    }
  }

  async paymentCancelled(req: Request, res: Response) {
    try {
      const { bookingId } = req.query;
      if (!bookingId) {
        return res.status(400).json({ message: "Missing bookingId" });
      }

      console.log(`Payment cancelled for booking ${bookingId}`);
      res.redirect(`fastbuss://payment-expired`);
    } catch (error) {
      console.log("Error in payment cancelled", error);
      res.status(500).json({ message: "Error in payment cancelled" });
    }
  }
}
