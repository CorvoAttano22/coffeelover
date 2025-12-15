import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { CoffeeVariant } from 'src/coffees/entities/coffee-variant.entity';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;
  
  @Column()
  variantId: number;

  @ManyToOne(() => CoffeeVariant, { eager: true }) // You can remove eager if not needed elsewhere
  variant: CoffeeVariant;
  
  @Column()
  productName: string;

  @Column()
  variantDescription: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; //price when purchasing

  get subtotal(): number {
    return Number(this.price) * this.quantity;
  }
}
