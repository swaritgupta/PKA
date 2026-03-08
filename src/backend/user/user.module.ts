import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { UserData, UserDataSchema } from '../schemas/user-data.schema';

@Module({
  imports: [
    // Register the User schema so @InjectModel(User.name) can be used in UserService
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // Register session archive collection for persisted chat history
    MongooseModule.forFeature([{ name: UserData.name, schema: UserDataSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
