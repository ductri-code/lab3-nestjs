import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { CouponsModule } from './coupons/coupons.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // Đổi sang postgres
      url: process.env.DATABASE_URL, // Tự động lấy đường dẫn Database từ biến môi trường trên Wispbyte
      autoLoadEntities: true,
      synchronize: true, // Vẫn giữ nguyên để tự tạo bảng
      ssl: true, // Bắt buộc bật SSL cho database online (Neon)
      extra: {
        ssl: {
          rejectUnauthorized: false, 
        },
      },
    }),
    OrdersModule,
    PaymentsModule,
    CouponsModule,
    ProductsModule,
    CategoriesModule,
    AuthModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}