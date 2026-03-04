import { Module } from '@nestjs/common';
import { DocumentController } from '../../controllers/document/document.controller';
import { DocumentService } from '../../services/document/document.service';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [VectorModule],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
