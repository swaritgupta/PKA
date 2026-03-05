import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiClient } from '../utilities/GeminiClient';

type RetrievedContext = {
  id: string;
  score?: number;
  text: string;
};

@Injectable()
export class LlmService {
  private readonly geminiClient: GeminiClient;
  private readonly llmModelName: string;

  constructor(private readonly configService: ConfigService) {
    this.geminiClient = new GeminiClient(this.configService);
    this.llmModelName =
      this.configService.get<string>('GEMINI_LLM_MODEL') ?? 'gemini-2.5-flash';
  }

  async generateAnswer(question: string, context: RetrievedContext[]) {
    const model = this.geminiClient.getObject().getGenerativeModel({
      model: this.llmModelName,
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 700,
      },
    });

    const prompt = this.buildPrompt(question, context);
    const result = await model.generateContent(prompt);
    const answer = result.response.text()?.trim() ?? '';

    return {
      answer: answer || 'I could not generate a response for this question.',
      model: this.llmModelName,
    };
  }

  private buildPrompt(question: string, context: RetrievedContext[]) {
    const contextText =
      context.length > 0
        ? context
            .map(
              (item, idx) =>
                `[${idx + 1}] id=${item.id} score=${item.score ?? 0}\n${item.text}`,
            )
            .join('\n\n')
        : 'No context available.';

    return `
You are a helpful assistant for a personal knowledge base.

Rules:
1) Use the provided context when it is relevant.
2) If context is missing or insufficient, say clearly what is missing.
3) Do not invent facts that are not supported by the context.
4) Keep the response concise and practical.
5) End with a short "Sources" section listing context ids used.

User question:
${question}

Retrieved context:
${contextText}
`;
  }
}
