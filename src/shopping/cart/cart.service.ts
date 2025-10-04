import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart} from './entities/cart.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Coffee } from 'src/coffees/entities/coffee.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
  ) {}

  //     async addItem(userId: number, dto: CreateCartDto) {
  //     const { productType, productId, quantity } = dto;

  //     // ✅ Fetch product from ProductService
  //     const product = await this.foodRepository.findBy({});
  //     if (!product) throw new NotFoundException('Product not found');

  //     const price = product.price;
  //     const total = price * quantity;

  //     // ✅ Check if already in cart
  //     let cartItem = await this.cartRepository.findOne({
  //       where: { user: { id: userId }, productType, productId },
  //     });

  //     if (cartItem) {
  //       cartItem.quantity += quantity;
  //       cartItem.total = cartItem.quantity * price;
  //     } else {
  //       cartItem = this.cartRepository.create({
  //         user: { id: userId },
  //         productType,
  //         productId,
  //         quantity,
  //         total,
  //       });
  //     }

  //     return this.cartRepository.save(cartItem);
  //   }
}
