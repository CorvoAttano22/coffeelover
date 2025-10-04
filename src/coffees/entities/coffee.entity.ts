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

@Entity()
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;

  //change brand to name, but also keep the brand field?
  @Column()
  brand: string;

  //newly added
  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  recommendations: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true }) //to be changed to required
  price: number;

  //newly added
  @Column({ nullable: true })
  image: string;

  @JoinTable()
  @ManyToMany((type) => Flavor, (flavor) => flavor.coffees, {
    cascade: true,
  })
  flavor: Flavor[];

  @OneToMany(() => Cart, (cart) => cart.coffee)
  cartItems: Cart[];
}
