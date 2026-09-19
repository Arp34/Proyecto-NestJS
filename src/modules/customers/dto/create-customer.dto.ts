import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateCustomerDto {

    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsString()
    @MinLength(10,{message:"debe tener minimo 10 numeros"})
    phone: string;
    
    @IsString()
    @IsNotEmpty()
    email: string;






}
