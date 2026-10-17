import { Category } from '../../categories/entities/category.entity';
export declare class Product {
    id: number;
    name: string;
    price: number;
    description: string;
    quantity: number;
    createdAt: Date;
    categoryId: number;
    category: Category;
    deletedAt: Date;
}
