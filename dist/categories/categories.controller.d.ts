import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: any): Promise<import("./entities/category.entity").Category>;
    findAll(): Promise<import("./entities/category.entity").Category[]>;
    findOne(id: string): Promise<import("./entities/category.entity").Category>;
    update(id: string, updateCategoryDto: any): Promise<import("./entities/category.entity").Category>;
    remove(id: string): Promise<void>;
}
