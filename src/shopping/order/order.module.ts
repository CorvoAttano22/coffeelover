import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order.item.entity';
import { StripeService } from './stripe.service';
import { Cart } from '../cart/entities/cart.entity';
import { CoffeeVariant } from 'src/coffees/entities/coffee-variant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { StripeWebhookController } from './stripe-webhook-controller.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Cart, CoffeeVariant]),
    ConfigModule,
  ],
  controllers: [OrderController, StripeWebhookController],
  providers: [OrderService, StripeService],
  exports: [OrderService]
})
export class OrderModule {}
