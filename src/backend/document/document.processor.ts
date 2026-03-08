import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { DocumentService } from './document.service';
import {DOCUMENT_PROCESSING_QUEUE,PROCESS_DOCUMENT_JOB} from '../queues/queue.constants';
import { EmbeddingProvider } from '../vector/vector.service';

interface DocumentJobPayload {
  file: Express.Multer.File;
  provider: EmbeddingProvider;
}

@Processor(DOCUMENT_PROCESSING_QUEUE) //producer
export class DocumentProcessor {
  constructor(private readonly documentService: DocumentService) {}

  // Worker that executes heavy file processing + embedding creation in background.
  @Process(PROCESS_DOCUMENT_JOB) //logic for processing the document
  async handleDocumentJob(job: Job<DocumentJobPayload>) {
    const { file, provider } = job.data;
    return await this.documentService.createTokens(file, provider);
  }
}
