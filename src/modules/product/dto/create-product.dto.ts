import { IsUUID, IsString, Length, IsNumber, Min, IsEnum, IsUrl, IsDate } from 'class-validator';
import { productAvailability, productStatus } from '../types/interface.js';

export class CreateProductDto {
    @IsUUID(4)
    id: string;

    @IsString()
    @Length(0, 120)
    name: string;

    @IsString()
    @Length(0, 500)
    description: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsString()
    @Length(0, 120)
    category_id: string;

    @IsEnum(productAvailability)
    availability: string;

    @IsEnum(productStatus)
    status: string;

    @IsString()
    @IsUrl()
    imageUrl: string;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;
}