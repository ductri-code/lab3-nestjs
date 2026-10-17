import { Repository, DataSource } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { StockDto } from './dto/stock.dto';
export declare class ProductsService {
    private productsRepository;
    private dataSource;
    constructor(productsRepository: Repository<Product>, dataSource: DataSource);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(page?: number, limit?: number): Promise<{
        data: Product[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<Product>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: number): Promise<void>;
    restore(id: number): Promise<void>;
    stockIn(id: number, stockDto: StockDto): Promise<Product>;
    stockOut(id: number, stockDto: StockDto): Promise<Product>;
}
