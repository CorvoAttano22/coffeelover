import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Auth } from 'src/iam/decorators/auth.decorator';
import { AuthType } from 'src/iam/enums/auth-type.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

//Guest Cart Management
const GUEST_ID_COOKIE_NAME = 'guestId';
const GUEST_ID_COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  secure: process.env.NODE_ENV === 'production',
};

@Auth(AuthType.Bearer)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Helper method
  private getAuthIdentifier(
    req: Request,
    res: Response,
    user: ActiveUserData,
  ): { userId?: number; guestId?: string } {
    if (user && user.sub) {
      return { userId: user.sub };
    }

    //Guest User
    let guestId = req.cookies[GUEST_ID_COOKIE_NAME];
    if (!guestId) {
      guestId = crypto.randomUUID();
      res.cookie(GUEST_ID_COOKIE_NAME, guestId, GUEST_ID_COOKIE_OPTIONS);
    }
    return { guestId };
  }

  @Auth(AuthType.None)
  @Post()
  async addToCart(
    @Body() addCartItemDto: AddCartItemDto,
    @ActiveUser() user: ActiveUserData,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authIdentifier = this.getAuthIdentifier(req, res, user);
    await this.cartService.addToCart(authIdentifier, addCartItemDto);

    const cartItems = await this.cartService.getCart(authIdentifier);
    const grandTotal = cartItems.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      items: cartItems,
      meta: {
        grandTotal,
        totalQuantity,
      },
    };
  }

  @Auth(AuthType.None)
  @Get()
  async getCart(
    @ActiveUser() user: ActiveUserData,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authIdentifier = this.getAuthIdentifier(req, res, user);
    const cartItems = await this.cartService.getCart(authIdentifier);

    const grandTotal = cartItems.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      items: cartItems,
      meta: {
        grandTotal,
        totalQuantity,
      },
    };
  }

  @Patch(':id')
  async updateQuantity(
    @Param('id', ParseIntPipe) cartItemId: number,
    @Body() updateDto: UpdateCartDto,
    @ActiveUser() user: ActiveUserData,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authIdentifier = this.getAuthIdentifier(req, res, user);
    // You'll need to implement a service method for this
    // return this.cartService.updateQuantity(authIdentifier, cartItemId, updateDto.quantity);
  }

  @Delete(':id')
  async removeItem(
    @Param('id', ParseIntPipe) cartItemId: number,
    @ActiveUser() user: ActiveUserData,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authIdentifier = this.getAuthIdentifier(req, res, user);
    // You'll need to implement a service method for this
    // return this.cartService.removeFromCart(authIdentifier, cartItemId);
  }
}
