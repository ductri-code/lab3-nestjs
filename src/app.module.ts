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
      url: 'postgresql://neondb_owner:npg_K2gQqSM8upCj@ep-tiny-mouse-b4wnakw1-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require', // Dán thẳng chuỗi Neon của bạn vào đây
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false, // Bắt buộc để kết nối Neon
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