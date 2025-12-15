import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order.item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from 'src/users/entities/user.entity';
import { Cart } from 'src/shopping/cart/entities/cart.entity';
import { CoffeeVariant } from 'src/coffees/entities/coffee-variant.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CoffeeVariant)
    private readonly variantRepo: Repository<CoffeeVariant>,
    private dataSource: DataSource,
  ) {}

  async createPendingOrder(
    userId: number,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cartItems = await this.cartRepo.find({
        where: { user: { id: userId } },
        relations: ['variant', 'variant.coffee'],
      });

      if (cartItems.length === 0) {
        throw new BadRequestException(
          'Cart is empty. Please add items before checking out.',
        );
      }

      let grandTotal = 0;
      const orderItems: OrderItem[] = [];

      //Stock Check & Deduction
      for (const cartItem of cartItems) {
        const variant = await queryRunner.manager.findOne(CoffeeVariant, {
          where: { id: cartItem.variant.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!variant) {
          throw new NotFoundException(
            `Product variant not found in stock: ${cartItem.variant.id}`,
          );
        }

        if (variant.inStock < cartItem.quantity) {
          throw new BadRequestException(
            `Not enough stock for ${cartItem.variant.coffee.name} (${cartItem.variant.weight}g). Available: ${variant.inStock}`,
          );
        }

        variant.inStock -= cartItem.quantity;
        await queryRunner.manager.save(CoffeeVariant, variant);

        const subtotal = Number(cartItem.variant.price) * cartItem.quantity;
        grandTotal += subtotal;

        //Order Snapshot
        const orderItem = new OrderItem();
        orderItem.variantId = variant.id;
        orderItem.productName = cartItem.variant.coffee.name;
        orderItem.variantDescription = `${cartItem.variant.weight}g`;
        orderItem.price = cartItem.variant.price;
        orderItem.quantity = cartItem.quantity;
        orderItems.push(orderItem);
      }

      const order = new Order();
      order.user = { id: userId } as User;
      order.status = OrderStatus.PENDING;
      order.total = grandTotal;

      // Map DTO fields to Order
      order.fullName = `${createOrderDto.firstName} ${createOrderDto.lastName}`;
      order.street =
        createOrderDto.street +
        (createOrderDto.apartment ? ` ${createOrderDto.apartment}` : '');
      order.city = createOrderDto.city;
      order.state = createOrderDto.state;
      order.postalCode = createOrderDto.postalCode;
      order.phone = createOrderDto.phone;
      order.items = orderItems;

      const savedOrder = await queryRunner.manager.save(Order, order);

      await queryRunner.manager.delete(Cart, { user: { id: userId } });

      await queryRunner.commitTransaction();

      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async handlePaymentSuccess(orderId: string): Promise<Order> {
    const id = Number(orderId);
    const order = await this.orderRepo.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    if (order.status === OrderStatus.SUCCESSFUL) {
      return order;
    }

    order.status = OrderStatus.SUCCESSFUL;
    return this.orderRepo.save(order);
  }

  async handlePaymentFailed(orderId: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const id = Number(orderId);

      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: ['items', 'items.variant'],
      });

      if (!order) {
        throw new NotFoundException(`Order #${id} not found during failure.`);
      }

      if (order.status !== OrderStatus.PENDING) {
        await queryRunner.commitTransaction();
        return order;
      }

      for (const item of order.items) {
        const variant = item.variant;

        variant.inStock += item.quantity;

        await queryRunner.manager.save(variant);
      }

      //Order status update
      order.status = OrderStatus.FAILED;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      console.log(`Order #${id} failed. Stock restored.`);
      return order;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error(
        `Transaction rollback due to failed restock for Order #${orderId}:`,
        err,
      );
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
