import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { HttpStatus, HttpException } from '@nestjs/common';

@Injectable()
export class UsersService {

  public constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  public async create(createUserDto: CreateUserDto) : Promise<UserDocument> {
    const emailExists = await this.findByEmail(createUserDto.email);

    if(emailExists) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: "Email Already Exists"
      }, HttpStatus.BAD_REQUEST);
    }
    
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel(createUserDto);
    return await user.save();
  }

  public async all() {
    return await this.userModel.find();
  }
 
  public async find(id: string) {
    return await this.userModel.findById(id);
  }

  public async update(id: string, updateUserDto: UpdateUserDto) {

    if(updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return await this.userModel.findByIdAndUpdate({
      _id: id
    },
    {
      $set: updateUserDto
    },
    {
      new: true
    });
  }

  public async delete(id: string) {
    return await this.userModel.deleteOne({
      _id: id
    }).exec();
  }

  public async findByEmail(email: string) {
    return await this.userModel.findOne({
      email
    });
  }
}
