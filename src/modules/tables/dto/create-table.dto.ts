import { 
    IsInt, 
    IsNotEmpty, 
    IsOptional, 
    IsPositive, 
    IsString, 
    IsIn, 
    MaxLength
} from "class-validator";

export class CreateTableDto {
    @IsInt({ message: 'El número de la mesa debe ser un número entero' })
    @IsPositive({ message: 'El número de la mesa debe ser positivo' })
    @IsNotEmpty({ message: 'El número de la mesa es requerido' })
    number: number;

    @IsInt({ message: 'La capacidad debe ser un número entero' })
    @IsPositive({ message: 'La capacidad debe ser mayor a 0' })
    @IsNotEmpty({ message: 'La capacidad es requerida' })
    capacity: number;

    @IsString({ message: 'La zona debe ser un texto' })
    @IsNotEmpty({ message: 'La zona es requerida' })
    @MaxLength(50, { message: 'La zona no puede exceder los 50 caracteres' })
    zone: string;

    @IsString()
    @IsOptional() // Es opcional porque la base de datos tiene un valor por defecto ("available")
    @IsIn(['available', 'occupied', 'reserved'], { 
        message: 'El estado debe ser uno de los siguientes: available, occupied, reserved' 
    })
    status?: string;
}