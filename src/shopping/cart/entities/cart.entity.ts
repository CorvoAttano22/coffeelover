import { CoffeeVariant } from 'src/coffees/entities/coffee-variant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  //implement the logic for guest user's cart
  @ManyToOne(() => User, (user) => user.cartItems)
  user: User;

  @Column({ nullable: true })
  guestId?: string;

  @ManyToOne(() => CoffeeVariant, { eager: true })
  variant: CoffeeVariant;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  get total(): number {
    return Number(this.variant.price) * this.quantity;
  }
}
