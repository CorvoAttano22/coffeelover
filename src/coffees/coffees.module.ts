import { Module } from '@nestjs/common';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from 'src/events/entities/event.entity/event.entity';
import { CoffeeVariant } from './entities/coffee-variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event, CoffeeVariant])],
  controllers: [CoffeesController],
  providers: [CoffeesService],
})
export class CoffeesModule {}
