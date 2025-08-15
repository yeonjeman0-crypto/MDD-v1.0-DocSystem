import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsModule } from './documents/documents.module';
import { PackagesModule } from './packages/packages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:', // 임시로 메모리 데이터베이스 사용
      autoLoadEntities: true,
      synchronize: true,
    }),
    DocumentsModule,
    PackagesModule,
  ],
})
export class AppModule {}