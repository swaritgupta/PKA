import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const { PDFParse } = require('pdf-parse');
import mammoth from 'mammoth';
import fs from 'fs';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import {EmbeddingProvider,VectorService} from '../vector/vector.service';
import { VoyageAiClient } from '../utilities/VoyageAIClient';
import { GeminiClient } from '../utilities/GeminiClient';

@Injectable()
export class DocumentService {

  private readonly voyageClient = new VoyageAiClient();
  private readonly geminiClient: GeminiClient;
  constructor(
    private readonly vectorService: VectorService,
    private readonly configService: ConfigService,
  ) {
    this.geminiClient = new GeminiClient(this.configService);
  }

   async createTokens(
    file: Express.Multer.File,
    provider: EmbeddingProvider = 'gemini',
  ) {
    if (!file) {
      throw new Error('File is required');
    }
    let rawText: string;
    if (file.mimetype == 'application/pdf') {
      rawText = await this.handlePDF(file);
    }
    else if (file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      rawText = await this.handleDOX(file);
    }
    else if (file.mimetype == 'text/plain') {
      rawText = await this.handleTXT(file);
    }
    else {
      throw new Error('Unsupported file type')
    }
    if (!rawText || !rawText.trim()) {
      throw new Error('No readable text extracted from file');
    }
    //splitting text recursively
    const document = await this.splitTextRecursively(rawText);
    console.log('document is:::', document);
    const embeddings = await this.vectorService.createEmbeddings(
      document,
      provider,
      {
        voyageClient: this.voyageClient,
        geminiClient: this.geminiClient,
      },
    );
    console.log('embedding is:::', embeddings);
    return embeddings;
  }

  private async handlePDF(file: Express.Multer.File) {
    let parser: InstanceType<typeof PDFParse> | null = null;
    try {
      const data = fs.readFileSync(file.path);
      parser = new PDFParse({ data });
      const result = await parser.getText();
      return result.text;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse PDF: ${message}`);
    } finally {
      if (parser) {
        await parser.destroy();
      }
    }
  }

  private async handleDOX(file: Express.Multer.File) {
    const result = await mammoth.extractRawText({ path: file.path });
    return result.value
  }

  private async handleTXT(file: Express.Multer.File) {
    const result = fs.readFileSync(file.path, 'utf-8');
    return result
  }

  private async splitTextRecursively(text: string) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,       // max tokens per chunk
      chunkOverlap: 100,    // overlap between chunks
      separators: ['\n\n', '\n', ' ', ''], // recursive fallback
    });
    return await splitter.createDocuments([text]);
  }

  
}
