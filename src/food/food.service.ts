import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.foodRepository.find();
  }

  async findOne(id: number) {
    const food = await this.foodRepository.findOne({
      where: { id: +id },
    });
    if (!food) {
      throw new NotFoundException('Coffee not found!');
    }
    return food;
  }

  async update(id: number, updateFoodDto: UpdateFoodDto) {
    const food = await this.foodRepository.preload({
      id: +id,
      ...updateFoodDto,
    });
    if (!food) {
      throw new NotFoundException('Food not found!');
    }
    return this.foodRepository.save(food);
  }

  async remove(id: number) {
    const food = await this.findOne(id);
    return this.foodRepository.remove(food);
  }
}
