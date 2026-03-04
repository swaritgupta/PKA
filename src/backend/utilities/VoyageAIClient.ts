
import { VoyageAIClient } from 'voyageai';

export class VoyageAiClient{  
  private voyageClient: VoyageAIClient;
  constructor(){
    this.voyageClient = new VoyageAIClient({
      apiKey: process.env.VOYAGE_API_KEY,
    });
  }
  public getObject(){
    return this.voyageClient;
  }
};