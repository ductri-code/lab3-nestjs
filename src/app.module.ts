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
      // Wispbyte injects DATABASE_URL at runtime. Never hardcode credentials here.
      url: getDatabaseUrl(),
      autoLoadEntities: true,
      // Avoid automatic schema changes in production. Use migrations for schema updates.
      synchronize: process.env.NODE_ENV !== 'production',
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

function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();

  if (!value) {
    throw new Error(
      'DATABASE_URL is missing. Set it in the hosting environment before starting the app.',
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error('DATABASE_URL is not a valid PostgreSQL connection URL.');
  }

  if (
    parsed.protocol !== 'postgres:' &&
    parsed.protocol !== 'postgresql:'
  ) {
    throw new Error('DATABASE_URL must use the postgres:// or postgresql:// protocol.');
  }

  if (
    process.env.NODE_ENV === 'production' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
  ) {
    throw new Error('Production DATABASE_URL must not point to localhost.');
  }

  return value;
}
