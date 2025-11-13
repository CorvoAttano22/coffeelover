import { IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { WeightOption } from '../entities/coffee-variant.entity';

export class UpdateCoffeeVariantDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsEnum(WeightOption)
  weight?: WeightOption;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;
}
