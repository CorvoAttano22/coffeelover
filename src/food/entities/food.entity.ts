import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum FoodCategory {
  MEAL = 'meal',
  DESSERT = 'dessert',
}

@Entity()
export class Food {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

@Column('decimal', { precision: 5, scale: 2, nullable: true }) //to be changed to required
  price: number;

  @Column()
  image: string;

  @Column('enum', { enum: FoodCategory })
  category: FoodCategory;
}
