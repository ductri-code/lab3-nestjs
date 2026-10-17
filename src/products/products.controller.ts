import { Controller, Get, Post, Body, Put, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StockDto } from './dto/stock.dto'; // Thêm import StockDto

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
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