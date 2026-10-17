import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// PartialType sẽ copy toàn bộ quy tắc của CreateProductDto nhưng biến chúng thành "không bắt buộc" (optional)
export class UpdateProductDto extends PartialType(CreateProductDto) {}