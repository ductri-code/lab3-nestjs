"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
let ProductsService = class ProductsService {
    productsRepository;
    dataSource;
    constructor(productsRepository, dataSource) {
        this.productsRepository = productsRepository;
        this.dataSource = dataSource;
    }
    async create(createProductDto) {
        const newProduct = this.productsRepository.create(createProductDto);
        return await this.productsRepository.save(newProduct);
    }
    async findAll(page = 1, limit = 10) {
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
    async findOne(id) {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: { category: true }
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product #${id} not found`);
        }
        return product;
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        Object.assign(product, updateProductDto);
        return await this.productsRepository.save(product);
    }
    async remove(id) {
        await this.productsRepository.softDelete(id);
    }
    async restore(id) {
        await this.productsRepository.restore(id);
    }
    async stockIn(id, stockDto) {
        const product = await this.findOne(id);
        product.quantity += stockDto.quantity;
        return await this.productsRepository.save(product);
    }
    async stockOut(id, stockDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const product = await queryRunner.manager.findOne(product_entity_1.Product, {
                where: { id }
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product #${id} not found`);
            }
            if (product.quantity < stockDto.quantity) {
                throw new common_1.BadRequestException('Số lượng xuất lớn hơn tồn kho hiện tại. Đã Rollback!');
            }
            product.quantity -= stockDto.quantity;
            const updatedProduct = await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();
            return updatedProduct;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], ProductsService);
//# sourceMappingURL=products.service.js.map