import { IsInt, Min } from 'class-validator';

export class StockDto {
  @IsInt()
  @Min(1) // Bắt buộc số lượng nhập/xuất phải từ 1 trở lên
  quantity: number;
}