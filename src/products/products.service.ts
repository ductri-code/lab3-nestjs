import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { StockDto } from './dto/stock.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(newProduct);
  }

  // --- 📄 LẤY DANH SÁCH CÓ PHÂN TRANG ---
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [result, total] = await this.productsRepository.findAndCount({
      relations: { category: true },
      take: Number(limit),
      skip: Number(skip),
    });

    return {
      data: result,
      page: Number(page),
      limit: Number(limit),
      total: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ 
      where: { id }, 
      relations: { category: true } 
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    await this.productsRepository.softDelete(id);
  }

  async restore(id: number): Promise<void> {
    await this.productsRepository.restore(id);
  }

  // --- 📥 NHẬP KHO ---
  async stockIn(id: number, stockDto: StockDto): Promise<Product> {
    const product = await this.findOne(id);
    product.quantity += stockDto.quantity;
    return await this.productsRepository.save(product);
  }

  // --- 📤 XUẤT KHO (DÙNG TRANSACTION) ---
  async stockOut(id: number, stockDto: StockDto): Promise<Product> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id }
      });

      if (!product) {
        throw new NotFoundException(`Product #${id} not found`);
      }

      if (product.quantity < stockDto.quantity) {
        throw new BadRequestException('Số lượng xuất lớn hơn tồn kho hiện tại. Đã Rollback!');
      }

      product.quantity -= stockDto.quantity;
      const updatedProduct = await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      return updatedProduct;
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; 
    } finally {
      await queryRunner.release();
    }
  }
}