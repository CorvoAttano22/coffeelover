import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCoffeeVariantDto } from './create-coffee-variant.dto';

export class CreateCoffeeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  image: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsArray()
  @IsString({ each: true })
  readonly flavors: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCoffeeVariantDto)
  variants: CreateCoffeeVariantDto[];
}
