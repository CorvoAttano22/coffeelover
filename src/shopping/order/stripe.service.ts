import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new InternalServerErrorException(
        'Stripe secret key (STRIPE_SECRET_KEY) is not configured in environment variables.',
      );
    }

    (this.stripe = new Stripe(secretKey)),
      {
        apiVersion: '2023-10-16',
      };
  }

  async createCheckoutSession(
    lineItems: any[],
    orderId: number,
    customerEmail: string,
  ) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail,
      metadata: {
        orderId: orderId.toString(),
      },
      success_url: `${this.configService.get('FRONTEND_URL')}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/checkout.html`,
    });

    return session;
  }

  verifyWebhook(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new InternalServerErrorException('Stripe Webhook Secret not configured in environment variables.');
    }

    try {
      //HMAC-SHA256
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
      return event;
    } catch (err) {
      throw new InternalServerErrorException(`Webhook Signature Verification Failed: ${err.message}`);
    }
  }

  async retrieveSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }
}
