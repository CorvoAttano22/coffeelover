import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Flavor } from './flavor.entity';
import { Cart } from 'src/shopping/cart/entities/cart.entity';
import { CoffeeVariant } from './coffee-variant.entity';

@Entity()
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  recommendations: number;

  @Column()
  image: string;

  @Column({ default: true })
  isAvailable: boolean;

  @JoinTable()
  @ManyToMany((type) => Flavor, (flavor) => flavor.coffees, {
    cascade: true,
  })
  flavors: Flavor[];

  @OneToMany(() => CoffeeVariant, (variant) => variant.coffee, {
    cascade: true,
  })
  variants: CoffeeVariant[];
}
