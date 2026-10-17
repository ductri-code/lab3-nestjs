import 'dotenv/config'; // Bắt buộc ở dòng 1 để đọc file .env trên Wispbyte
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mở CORS cho phép Frontend gọi API
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || '*',
    credentials: true,
  });

  // Thêm tiền tố /api cho toàn bộ đường dẫn (VD: /api/products)
  app.setGlobalPrefix('api');

  // Bật Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Lấy cổng do Wispbyte cấp (SERVER_PORT hoặc PORT), nếu chạy máy nhà thì dùng 3000
  const port = process.env.SERVER_PORT || process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
}
bootstrap();