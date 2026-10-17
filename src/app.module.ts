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
      type: 'postgres',
      // Dùng trực tiếp process.env.DATABASE_URL nếu Wispbyte đọc được, 
      // nếu vẫn lỗi, bạn có thể dán thẳng chuỗi kết nối vào đây như hình bạn của bạn:
      url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_K2gQqSM8upCj@ep-tiny-mouse-b4wnakw1-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require',
      autoLoadEntities: true,
      synchronize: true, // Lấy theo biến DB_SYNCHRONIZE trên Wispbyte
      ssl: {
        rejectUnauthorized: false, // Bắt buộc cho Neon
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