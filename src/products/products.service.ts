import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Thêm DataSource cho Transaction
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { StockDto } from './dto/stock.dto'; // Import file bạn vừa tạo

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private dataSource: DataSource, // Tiêm DataSource vào
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(newProduct);
  }

  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find({ 
      relations: { category: true } 
    });
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
      // 1. Tìm product (Dùng queryRunner manager để đảm bảo nằm trong transaction)
      const product = await queryRunner.manager.findOne(Product, {
        where: { id }
      });

      if (!product) {
        throw new NotFoundException(`Product #${id} not found`);
      }

      // 2. Kiểm tra tồn kho
      if (product.quantity < stockDto.quantity) {
        throw new BadRequestException('Số lượng xuất lớn hơn tồn kho hiện tại. Đã Rollback!');
      }

      // 3. Trừ quantity
      product.quantity -= stockDto.quantity;

      // 4. Save product
      const updatedProduct = await queryRunner.manager.save(product);

      // Nếu mọi thứ OK -> Lưu thật vào Database
      await queryRunner.commitTransaction();
      return updatedProduct;
      
    } catch (error) {
      // Có lỗi (như xuất quá số lượng) -> Hủy bỏ mọi thay đổi
      await queryRunner.rollbackTransaction();
      throw error; 
    } finally {
      // Giải phóng connection
      await queryRunner.release();
    }
  }
}