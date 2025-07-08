import { IsEnum, IsNumber, IsString } from 'class-validator';
import { FoodCategory } from '../../food/entities/food.entity';
import { Type } from 'class-transformer';

export class CreateFoodDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly description: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  readonly price: number;

  @IsString()
  readonly image: string;

  @IsEnum(FoodCategory)
  readonly category: FoodCategory;
}
