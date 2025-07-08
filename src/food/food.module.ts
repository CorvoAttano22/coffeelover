import { Module } from '@nestjs/common';
import { FoodService } from './food.service';
import { FoodController } from './food.controller';
import { Food } from './entities/food.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Food, Event])],
  controllers: [FoodController],
  providers: [FoodService],
})
export class FoodModule {}
