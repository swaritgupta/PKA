import {Body,Controller,Delete,Get,Param,Patch,Post} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Create a user
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Get all users
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Get one user by id
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Update user by id
  @Patch('/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  // Delete user by id
  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
