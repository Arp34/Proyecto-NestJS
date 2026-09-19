import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';




export interface Customer {
    id:number,
    name: string,
    email: string,
    phone: string
  }

@Injectable()
export class CustomersService {
  private readonly customers: Customer  [] = [];

  create(createCustomerDto: CreateCustomerDto) {
 

    const emailExist = this.customers.some(
      customer => customer.email === createCustomerDto.email.toLowerCase()

    ) 

    if(emailExist){
      return{
        message:"email ya fue registrado"
      }

    } 
    const newCustomer :Customer = {
      id: this.customers.length + 1,
      name: createCustomerDto.name.toLowerCase(),
      email: createCustomerDto.email.toLowerCase(),
      phone: createCustomerDto.phone,
    };

    this.customers.push(newCustomer);

    return {
      message: 'customer create succesfully',
      customer:newCustomer
    }

  }

  findAll() {
    return this.customers;
  }

  findOne(id: number) {
    if(!id){
    return {
      ok:false,
      message:""
    }};
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
