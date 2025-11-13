import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Coffee } from './coffee.entity';

export enum WeightOption {
  SMALL_250G = 250,
  MEDIUM_500G = 500,
  LARGE_1000G = 1000,
}

@Entity()
@Unique(['coffee', 'weight'])
export class CoffeeVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Coffee, (coffee) => coffee.variants, { onDelete: 'CASCADE' })
  coffee: Coffee;

  @Column({
    type: 'enum',
    enum: WeightOption,
  })
  weight: WeightOption;

  @Column('decimal', { precision: 5, scale: 2 })
  price: number;

  @Column({ default: true })
  inStock: boolean;
}
