import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity'; // Import file entity

@Module({
  // Phải có dòng imports này để TypeORM nhận diện được bảng Category
  imports: [TypeOrmModule.forFeature([Category])], 
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}