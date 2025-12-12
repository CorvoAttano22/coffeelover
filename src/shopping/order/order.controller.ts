import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { StripeService } from './stripe.service';
import { OrderService } from './order.service';
import { Auth } from 'src/iam/decorators/auth.decorator';
import { AuthType } from 'src/iam/enums/auth-type.enum';

@Auth(AuthType.Bearer)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('checkout')
  async checkout(
    @ActiveUser() user: ActiveUserData,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const order = await this.orderService.createPendingOrder(
      user.sub,
      createOrderDto,
    );

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.productName,
          description: item.variantDescription,
        },
        unit_amount: Math.round(Number(item.price) * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    const session = await this.stripeService.createCheckoutSession(
      lineItems,
      order.id,
      user.email,
    );

    return { url: session.url };
  }
}
