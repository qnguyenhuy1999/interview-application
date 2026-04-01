import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAiProvider } from './ai-provider.interface';

@Injectable()
export class GeminiProvider implements IAiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName = 'gemini-2.0-flash';

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  get name(): string {
    return 'gemini';
  }

  async chat(systemPrompt: string, userPrompt: string): Promise<{ content: string }> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });

    const combinedPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
      generationConfig: { responseMimeType: 'text/plain' },
    });

    const response = result.response;
    const text = response.text().trim();

    if (!text) {
      throw new Error('Gemini returned empty response');
    }

    this.logger.debug(`Gemini response received (${text.length} chars)`);
    return { content: text };
  }

  isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      return (
        msg.includes('rate limit') ||
        msg.includes('quota') ||
        msg.includes('429') ||
        msg.includes('too many requests') ||
        msg.includes('resource has been exhausted')
      );
    }
    return false;
  }
}
