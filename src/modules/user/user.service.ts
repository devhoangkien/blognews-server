import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { InjectModel } from '@app/common/transformers/model.transformer';
import { CacheIOResult } from '@app/common/cache/cache.service';
import { User } from '@app/models/user.model';
import { MongooseModel, MongooseDoc, MongooseID } from '@app/common/interfaces/mongoose.interface'
import { CreateUserDto } from './dto/createUser.dto';


@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userModel: MongooseModel<User>,
  ) { }

  async createUser(createUser: CreateUserDto): Promise<User> {
    const existedUser = await this.userModel.findOne({ email: createUser.email }).exec();
    if (existedUser) {
      throw `User with email ${createUser.email} already exists`;
    }
    const user = await this.userModel.create(createUser);
    return user;
  }
}