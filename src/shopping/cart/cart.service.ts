import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CoffeeVariant } from 'src/coffees/entities/coffee-variant.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CoffeeVariant)
    private readonly variantRepository: Repository<CoffeeVariant>,
  ) {}

  async addToCart(
    authIdentifier: { userId?: number; guestId?: string },
    itemDto: AddCartItemDto,
  ): Promise<Cart> {
    const { variantId, quantity } = itemDto;

    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
      relations: ['coffee'],
    });

    if (!variant) {
      throw new NotFoundException(
        `Coffee variant with ID ${variantId} not found.`,
      );
    }
    if (!variant.inStock) {
      throw new BadRequestException(`Variant is currently out of stock.`);
    }

    const cartOwnerWhere = {};
    if (authIdentifier.userId) {
      cartOwnerWhere['user'] = { id: authIdentifier.userId };
      cartOwnerWhere['guestId'] = null;
    } else if (authIdentifier.guestId) {
      cartOwnerWhere['guestId'] = authIdentifier.guestId;
      cartOwnerWhere['user'] = null;
    } else {
      throw new BadRequestException(
        'Cannot add to cart without a valid user or guest ID.',
      );
    }

    const existingItem = await this.cartRepository.findOne({
      where: {
        ...cartOwnerWhere,
        variant: { id: variantId },
      },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      return this.cartRepository.save(existingItem);
    } else {
      const ownershipFields = authIdentifier.userId
        ? { user: { id: authIdentifier.userId }, guestId: undefined }
        : { guestId: authIdentifier.guestId, user: undefined };

      const newCartItem = this.cartRepository.create({
        ...ownershipFields,
        variant: variant,
        quantity: quantity,
      });

      return this.cartRepository.save(newCartItem);
    }
  }

  async getCart(authIdentifier: {
    userId?: number;
    guestId?: string;
  }): Promise<Cart[]> {
    const ownerQuery = authIdentifier.userId
      ? { user: { id: authIdentifier.userId } }
      : { guestId: authIdentifier.guestId };

    return this.cartRepository.find({
      where: ownerQuery,
      relations: ['variant', 'variant.coffee', 'user'],
    });
  }

  async update(
    authIdentifier: { userId?: number; guestId?: string },
    itemId: number,
    quantity: number, //new total
  ): Promise<any> {
    const ownershipWhere = authIdentifier.userId
      ? { user: { id: authIdentifier.userId } }
      : { guestId: authIdentifier.guestId };

    const cartItem = await this.cartRepository.findOne({
      where: { id: itemId, ...ownershipWhere },
      relations: ['variant'],
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item #${itemId} not found`);
    }

    if (quantity > cartItem.variant.inStock) {
      throw new BadRequestException(
        `Sorry, only ${cartItem.variant.inStock} left in stock.`,
      );
    }

    cartItem.quantity = quantity;
    await this.cartRepository.save(cartItem);

    return this.getCart(authIdentifier);
  }

  async remove(
    authIdentifier: { userId?: number; guestId?: string },
    itemId: number,
  ): Promise<any> {
    // Returns the updated cart
    const ownershipWhere = authIdentifier.userId
      ? { user: { id: authIdentifier.userId } }
      : { guestId: authIdentifier.guestId };

    const cartItem = await this.cartRepository.findOne({
      where: {
        id: itemId,
        ...ownershipWhere,
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item #${itemId} not found`);
    }

    await this.cartRepository.remove(cartItem);

    return this.getCart(authIdentifier);
  }
}
