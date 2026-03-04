import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient{

  private geminiClient;
  constructor(private configService: ConfigService){
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }
    this.geminiClient = new GoogleGenerativeAI(apiKey);
  }

  public getObject(){
    return this.geminiClient;
  }
}