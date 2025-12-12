import { Controller, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';
import { OrderService } from '../order/order.service';

@Controller('stripe')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly ordersService: OrderService,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = req.rawBody;

    if (!signature || !rawBody) {
      return res.status(400).send('Missing signature or body.');
    }

    try {
      const event = this.stripeService.verifyWebhook(rawBody, signature);
      const session = event.data.object;

      //Event Type
      if (event.type === 'checkout.session.completed') {
        const orderId = session['metadata']?.['orderId'];

        if (orderId) {
          await this.ordersService.handlePaymentSuccess(orderId);
          console.log(`Order ${orderId} successfully marked as PAID.`);
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Stripe Webhook Error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
