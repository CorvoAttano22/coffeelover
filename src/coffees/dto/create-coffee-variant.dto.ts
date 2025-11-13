import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { WeightOption } from '../entities/coffee-variant.entity';

export class CreateCoffeeVariantDto {
  @IsEnum(WeightOption)
  weight: WeightOption;

  @IsNumber()
  price: number;

  @IsOptional()
  inStock?: boolean;
}
