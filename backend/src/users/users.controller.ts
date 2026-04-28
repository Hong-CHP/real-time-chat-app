import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateOne(+id, updateUserDto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  removeOne(@Param('id') id: string) {
    return this.usersService.removeOne(+id);
  }

  @Get('search')
  search(@Req() req, @Query('keyword') keyword: string) {
    return this.usersService.findMany(keyword, req.user.id)
  }

  @Get('me')
  getMe(@CurrentUser() me: any) {
    return this.usersService.findById(me.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() me: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateMe(me.id, updateUserDto);
  }

  @Delete('me')
  removeMe(@CurrentUser() me: any) {
    return this.usersService.removeMe(me);
  }
}
