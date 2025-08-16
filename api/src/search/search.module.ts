import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SearchService } from './search.service.simple';
import { SearchController } from './search.controller';
import { DocumentIndexerService } from './document-indexer.service.simple';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  providers: [SearchService, DocumentIndexerService],
  controllers: [SearchController],
  exports: [SearchService, DocumentIndexerService],
})
export class SearchModule {}