import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Order } from 'src/shopping/order/entities/order.entity';
import { OrderItem } from 'src/shopping/order/entities/order.item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, OrderItem])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
