import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { UserData, UserDataDocument } from '../schemas/user-data.schema';
import * as bcrypt from 'bcrypt';
import { ChatTurn } from '../types/session.types';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserData.name) private readonly userDataModel: Model<UserDataDocument>,
  ) {}

  // Create a new user document in MongoDB
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check for duplicate email before creating the user
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Store only hashed password in database.
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  // Fetch all users from MongoDB
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Fetch one user by Mongo document id
  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  // Fetch user by email (without password field)
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Fetch user by email and explicitly include password for login verification
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  // Update a user document and return the updated version
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.email) {
      // If email is being updated, ensure it is not used by another user
      const emailOwner = await this.userModel
        .findOne({ email: updateUserDto.email, _id: { $ne: id } })
        .exec();
      if (emailOwner) {
        throw new ConflictException('Email already exists');
      }
    }

    // Re-hash password if user is updating it.
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return updatedUser;
  }

  // Delete a user document by id
  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return deletedUser;
  }

  // Persist final session chat history to Mongo for research/analytics.
  async saveSessionHistory(params: {
    userId: string;
    sessionId: string;
    sessionStartedAt: string;
    sessionEndedAt: string;
    chatHistory: ChatTurn[];
  }): Promise<UserData> {
    const { userId, sessionId, sessionStartedAt, sessionEndedAt, chatHistory } =
      params;

    const record = new this.userDataModel({
      userId,
      sessionId,
      sessionStartedAt,
      sessionEndedAt,
      chatHistory,
    });

    return record.save();
  }
}
