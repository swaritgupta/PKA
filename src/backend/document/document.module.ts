import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { VectorModule } from '../vector/vector.module';
import { DOCUMENT_PROCESSING_QUEUE } from '../queues/queue.constants';
import { DocumentProcessor } from './document.processor';

@Module({
  imports: [
    VectorModule,
    BullModule.registerQueue({
      name: DOCUMENT_PROCESSING_QUEUE,
    }),
  ],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentProcessor],
  exports: [DocumentService],
})
export class DocumentModule {}
