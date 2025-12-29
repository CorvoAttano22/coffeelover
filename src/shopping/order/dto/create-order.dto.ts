import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'John', description: 'Customer first name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Customer last name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '123 Coffee Lane', description: 'Shipping street address' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  apartment?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}