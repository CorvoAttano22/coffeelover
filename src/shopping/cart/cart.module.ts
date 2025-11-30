import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { User } from 'src/users/entities/user.entity';
import { Coffee } from 'src/coffees/entities/coffee.entity';
import { CoffeeVariant } from 'src/coffees/entities/coffee-variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, User, Coffee, CoffeeVariant])],
  controllers: [CartController],
  providers: [CartService],
})

export class CartModule {}
