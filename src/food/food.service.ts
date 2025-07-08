import { Injectable } from '@nestjs/common';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { DataSource, Repository } from 'typeorm';
import { Food } from './entities/food.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
    private readonly connection: DataSource,
  ) {}

  async create(createFoodDto: CreateFoodDto) {
  const food = this.foodRepository.create(createFoodDto);
  return this.foodRepository.save(food);
}


  findAll() {
    return `This action returns all food`;
  }

  findOne(id: number) {
    return `This action returns a #${id} food`;
  }

  update(id: number, updateFoodDto: UpdateFoodDto) {
    return `This action updates a #${id} food`;
  }

  remove(id: number) {
    return `This action removes a #${id} food`;
  }
}
