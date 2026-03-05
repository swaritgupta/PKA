import { Injectable } from '@nestjs/common';
import { EmbeddingProvider, VectorService } from '../vector/vector.service';
import { GeminiClient } from '../utilities/GeminiClient';
import { ConfigService } from '@nestjs/config';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class ChatService {
  private readonly geminiClient: GeminiClient;
  provider: EmbeddingProvider = 'gemini';
  constructor(
    private readonly vectorService: VectorService,
    private readonly configService: ConfigService,
    private readonly llmService: LlmService,
  ){
    this.geminiClient = new GeminiClient(this.configService);
  }

  async processUserText(data: any){
    const text = data?.text?.trim?.();

    if (!text) {
      throw new Error('User text is required');
    }

    const chunks = [{ pageContent: text }];

    try{
      const embeddings = await this.vectorService.createGeminiEmbeddings(
        chunks,
        this.geminiClient,
      );

      const queryEmbedding = embeddings[0];
      if (!queryEmbedding || queryEmbedding.length === 0) {
        throw new Error('Failed to create query embedding');
      }

      const matches = await this.vectorService.searchSimilar(queryEmbedding, 5);
      const context = (matches ?? []).map((match: any) => ({
        id: match.id,
        score: match.score,
        text: String(match.metadata?.text ?? ''),
      }));

      const completion = await this.llmService.generateAnswer(text, context);
      return {
        question: text,
        ...completion,
        retrievedContextCount: context.length,
      };
    } catch (err) {
      console.error('Error while processing user text', err);
      throw err;
    }
  }
}
