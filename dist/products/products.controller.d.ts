import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StockDto } from './dto/stock.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<import("./entities/product.entity").Product>;
    findAll(page?: number, limit?: number): Promise<{
        data: import("./entities/product.entity").Product[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("./entities/product.entity").Product>;
    remove(id: string): Promise<void>;
    restore(id: string): Promise<void>;
    stockIn(id: string, stockDto: StockDto): Promise<import("./entities/product.entity").Product>;
    stockOut(id: string, stockDto: StockDto): Promise<import("./entities/product.entity").Product>;
}
