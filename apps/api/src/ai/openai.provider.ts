import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { IAiProvider } from './ai-provider.interface';

@Injectable()
export class OpenAiProvider implements IAiProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  get name(): string {
    return 'openai';
  }

  async chat(systemPrompt: string, userPrompt: string): Promise<{ content: string }> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty response');
    }

    this.logger.debug(`OpenAI response received (${content.length} chars)`);
    return { content };
  }

  isRateLimitError(error: unknown): boolean {
    if (error instanceof OpenAI.APIError) {
      return error.status === 429;
    }
    return false;
  }
}
