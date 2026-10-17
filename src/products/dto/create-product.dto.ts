import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  categoryId: number; // Đã đổi từ category (string) sang categoryId (number)

  @IsInt()
  @Min(0)
  quantity: number;
}