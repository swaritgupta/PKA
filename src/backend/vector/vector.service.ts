import { Injectable } from '@nestjs/common';
import { VoyageAiClient } from '../utilities/VoyageAIClient';
import { GeminiClient } from '../utilities/GeminiClient';
import { PineCone } from '../utilities/PineConeDB';
import { randomUUID } from 'crypto';

export type EmbeddingProvider = 'voyage' | 'gemini';

@Injectable()
export class VectorService {

  private readonly pc: PineCone = new PineCone();

  // create embeddings using provider selected by user
  async createEmbeddings(chunks: any[], provider: EmbeddingProvider,
    clients: {
      voyageClient?: VoyageAiClient;
      geminiClient?: GeminiClient;
    },
  ) {

    console.log("In create embeddings")
    let embeddings: number[][];
    if (provider === 'voyage') {
      if (!clients.voyageClient) {
        throw new Error('Voyage client is required when provider is "voyage"');
      }
      embeddings = await this.createVoyageEmbeddings(chunks, clients.voyageClient);
    }

    else if (provider === 'gemini') {
      console.log("provider is gemini")
      if (!clients.geminiClient) {
        throw new Error('Gemini client is required when provider is "gemini"');
      }
      embeddings = await this.createGeminiEmbeddings(chunks, clients.geminiClient);
    }
    else{
      throw new Error(`Unsupported embedding provider: ${provider}`);
    }
    await this.storeEmbeddings(chunks, embeddings);
    return embeddings;
    
  }

  private async createVoyageEmbeddings(
    chunks: any[],
    voyageClient: VoyageAiClient,
  ) {
    const embeddings: number[][] = [];
    for (const chunk of chunks) {
      const text = this.extractChunkText(chunk);
      if (!text) {
        continue;
      }
      const result = await voyageClient.getObject().embed({
        input: text,
        model: 'voyage-3.5',
      });
      const vector = result.data?.[0]?.embedding ?? [];
      embeddings.push(vector);
    }
    return embeddings;
  }

   async createGeminiEmbeddings(chunks: any[], geminiClient: GeminiClient) {
    console.log('in create gemini embedding');
    const embeddings: number[][] = [];
    const model = geminiClient.getObject().getGenerativeModel({
      model: 'gemini-embedding-001',
    });

    for (const chunk of chunks) {
      const text = this.extractChunkText(chunk);
      if (!text) {
        continue;
      }
      const result = await model.embedContent(text);
      const vector = result.embedding?.values ?? [];
      embeddings.push(vector);
    }

    return embeddings;
  }

  // storing the embeddings in vector db
   async storeEmbeddings(chunks: any[], embeddings: number[][]): Promise<void> {
     for (let i = 0; i < chunks.length; i++) {
       const chunk = chunks[i];
       const vector = embeddings[i];
       const id = chunk.id ?? randomUUID();
       const text = this.extractChunkText(chunk);

       if (!vector || vector.length === 0) {
         continue;
       }

       await this.storeVector(id, text, vector);
     }
   }

  async storeVector(id: string, text: string, embedding: number[]){
    try{
      await this.pc.getObject().upsert({
        records: [
          {
            id,
            values: embedding,
            metadata: {
              text,
            },
          },
        ]
      })
    }catch(err){
      console.error('Error storing vector', err);
    }
  }

  private extractChunkText(chunk: any): string {
    if (typeof chunk === 'string') {
      return chunk;
    }
    if (typeof chunk?.pageContent === 'string') {
      return chunk.pageContent;
    }
    if (typeof chunk?.text === 'string') {
      return chunk.text;
    }
    return '';
  }

  //perform semantic search
  async searchSimilar(embedding: number[],topK: number = 5): Promise<any[]> {
    try{
      const results = await this.pc.getObject().query({
        topK: topK,
        vector: embedding,
        includeMetadata: true
      });
      return results.matches;
    }
    catch(error){
      console.error('Error searching similar vectors:', error);
      throw error;
    }
    
  }
}
