/**
 * @file User model
 * @module module/tag/model
 */

import { AutoIncrementID } from '@typegoose/auto-increment'
import { prop, plugin, modelOptions } from '@typegoose/typegoose'
import { IsString, MaxLength, Matches, IsNotEmpty, IsArray, ArrayUnique, IsEmail, IsIn } from 'class-validator'
import { generalAutoIncrementIDConfig } from '@app/common/constants/increment.constant'
import { getProviderByTypegooseClass } from '@app/common/transformers/model.transformer'
import { mongoosePaginate } from '@app/utils/paginate'

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@plugin(mongoosePaginate)
@plugin(AutoIncrementID, generalAutoIncrementIDConfig)
@modelOptions({
  schemaOptions: {
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
  },
})
export class User {
  @prop({ unique: true })
  id: number

  @IsNotEmpty()
  @Matches(/[a-zA-Z0-9_-]{2,20}/)
  @IsString()
  @MaxLength(50)
  @prop({ required: true, validate: /\S+/ })
  username: string

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(30)
  @prop({ required: true, validate: /\S+/ })
  email: string

  @IsString()
  @MaxLength(20)
  @prop({ required: false })
  firstName: string

  @IsString()
  @MaxLength(20)
  @prop({ required: false })
  lastName: string

  @IsNotEmpty()
  @IsString()
  @prop({ required: true })
  password: string

  @IsString()
  @prop({ default: '' })
  avatar: string;

  @IsString()
  @IsIn([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER])
  @prop({ default: UserRole.USER })
  role: string;

  @IsString()
  @IsIn([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BANNED])
  status: string;

  @prop({ default: Date.now, immutable: true })
  create_at?: Date

  @prop({ default: Date.now })
  update_at?: Date

}

export const UserProvider = getProviderByTypegooseClass(User)