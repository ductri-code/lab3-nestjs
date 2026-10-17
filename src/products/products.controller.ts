import { Controller, Get, Post, Body, Put, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StockDto } from './dto/stock.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // --- 📄 API LẤY DANH SÁCH CÓ PHÂN TRANG ---
  // Ví dụ gọi: GET /products?page=1&limit=10
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.productsService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.productsService.restore(+id);
  }

  // --- API Nhập Kho ---
  @Patch(':id/stock/in')
  stockIn(@Param('id') id: string, @Body() stockDto: StockDto) {
    return this.productsService.stockIn(+id, stockDto);
  }

  // --- API Xuất Kho ---
  @Patch(':id/stock/out')
  stockOut(@Param('id') id: string, @Body() stockDto: StockDto) {
    return this.productsService.stockOut(+id, stockDto);
  }
}