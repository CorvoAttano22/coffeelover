import {IsInt, Min } from 'class-validator';

export class CreateCartDto {
  @IsInt({ message: 'Product ID must be an integer' })
  @Min(1, { message: 'Product ID must be at least 1' })
  productId: number;

  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
