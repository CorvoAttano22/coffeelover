import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity/event.entity';
import { CoffeeVariant } from './entities/coffee-variant.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(CoffeeVariant)
    private readonly variantRepository: Repository<CoffeeVariant>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly connection: DataSource,
  ) {}

  async findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return await this.coffeeRepository.find({
      relations: ['flavors', 'variants'],
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: { id: +id },
      relations: ['flavors', 'variants'],
    });
    if (!coffee) {
      throw new NotFoundException('Coffee not found!');
    }
    return coffee;
  }

 async create(createCoffeeDto: CreateCoffeeDto) {
  // 1️⃣ Handle flavors
  let flavors: Flavor[] = [];
  if (createCoffeeDto.flavors?.length) {
    flavors = await Promise.all(
      createCoffeeDto.flavors.map(name => this.preloadFlavorByName(name)),
    );
  }

  // 2️⃣ Create and save coffee first
  let coffee = this.coffeeRepository.create({
    name: createCoffeeDto.name,
    brand: createCoffeeDto.brand,
    description: createCoffeeDto.description,
    image: createCoffeeDto.image,
    isAvailable: createCoffeeDto.isAvailable ?? true,
    flavors,
  });

  coffee = await this.coffeeRepository.save(coffee);

  // 3️⃣ Now create variants referencing the persisted coffee
  if (createCoffeeDto.variants?.length) {
    const variants = createCoffeeDto.variants.map(v =>
      this.variantRepository.create({
        weight: v.weight,
        price: v.price,
        inStock: v.inStock ?? true,
        coffee,
      }),
    );
    await this.variantRepository.save(variants);
    coffee.variants = variants;
  }

  return coffee;
}


  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    // 1️⃣ Handle flavors if provided
    let flavors: Flavor[] | undefined = undefined;
    if (updateCoffeeDto.flavor?.length) {
      flavors = await Promise.all(
        updateCoffeeDto.flavor.map((name) => this.preloadFlavorByName(name)),
      );
    }

    // 2️⃣ Preload coffee with updated properties
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      name: updateCoffeeDto.name,
      brand: updateCoffeeDto.brand,
      description: updateCoffeeDto.description,
      image: updateCoffeeDto.image,
      isAvailable: updateCoffeeDto.isAvailable,
      flavors: flavors,
    });

    if (!coffee) {
      throw new NotFoundException('Coffee not found!');
    }

    // 3️⃣ Handle variants if provided
    if (updateCoffeeDto.variants?.length) {
      // Load current variants
      const currentVariants = await this.variantRepository.find({
        where: { coffee: { id: coffee.id } },
      });

      // Remove variants not included in update payload
      const variantIdsToKeep = updateCoffeeDto.variants
        .filter((v) => v.id)
        .map((v) => v.id);
      const variantsToRemove = currentVariants.filter(
        (v) => !variantIdsToKeep.includes(v.id),
      );
      if (variantsToRemove.length > 0) {
        await this.variantRepository.remove(variantsToRemove);
      }

      // Preload existing and create new variants
      coffee.variants = await Promise.all(
        updateCoffeeDto.variants.map(async (v) => {
          if (v.id) {
            const existingVariant = await this.variantRepository.preload({
              id: v.id,
              weight: v.weight,
              price: v.price,
              inStock: v.inStock ?? true,
              coffee: coffee,
            });
            if (!existingVariant) {
              throw new NotFoundException(`Variant with id ${v.id} not found`);
            }
            return existingVariant;
          } else {
            // New variant
            return this.variantRepository.create({
              weight: v.weight,
              price: v.price,
              inStock: v.inStock ?? true,
              coffee: coffee,
            });
          }
        }),
      );
    }

    // 4️⃣ Save coffee with updated flavors and variants
    return this.coffeeRepository.save(coffee);
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  //to be understood
  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      coffee.recommendations++;

      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
  //

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const normalized = name.trim().toLowerCase();
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name: normalized },
    });

    if (existingFlavor) {
      return existingFlavor;
    }

    const newFlavor = this.flavorRepository.create({ name: normalized });
    return await this.flavorRepository.save(newFlavor);
  }
}
