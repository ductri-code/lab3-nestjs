import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';

// Import các "ổ khóa" phân quyền
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // 1. TẠO DANH MỤC: Khóa lại! (Chỉ Admin mới có quyền)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createCategoryDto: any) {
    return this.categoriesService.create(createCategoryDto);
  }

  // 2. XEM DANH SÁCH DANH MỤC: Mở cửa tự do! (Ai cũng xem được)
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  // 3. XEM CHI TIẾT 1 DANH MỤC: Mở cửa tự do!
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  // 4. SỬA DANH MỤC: Khóa lại! (Chỉ Admin mới có quyền)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateCategoryDto: any) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  // 5. XÓA DANH MỤC: Khóa lại! (Chỉ Admin mới có quyền)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}