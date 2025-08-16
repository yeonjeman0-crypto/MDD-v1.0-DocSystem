import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // Compression for better performance
  app.use(compression());

  // Global prefix for API routes (excludes health endpoints)
  app.setGlobalPrefix('api', {
    exclude: ['/health', '/ping']
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 정적 파일 서빙 (PDF 파일들) - NestJS의 static assets 사용
  const pdfPath = join(__dirname, '..', '..', '절차서 PDF');
  console.log('📁 Static PDF path resolved to:', pdfPath);
  app.useStaticAssets(pdfPath, { prefix: '/pdf/' });

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:5173', 
      'http://localhost:5174', 
      'http://localhost:5175', 
      'http://localhost:5176',  // Admin Portal 포트
      'http://localhost:5177',
      'http://localhost:5178'   // 현재 포트 추가
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('MDD v1.0 Document System API')
    .setDescription('Maritime Document Distribution System API')
    .setVersion('1.0')
    .addTag('Document Lists', 'JSON-based document structure management')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = 3005; // 새로운 포트 사용
  await app.listen(port);
  
  console.log(`🚀 MDD API Server running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();