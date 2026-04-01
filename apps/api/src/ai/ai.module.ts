import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { GeminiProvider } from './gemini.provider';
import { OpenAiProvider } from './openai.provider';
import { IAiProvider } from './ai-provider.interface';

export const GEMINI_PROVIDER = Symbol('GEMINI_PROVIDER');
export const OPENAI_PROVIDER = Symbol('OPENAI_PROVIDER');

@Module({
  imports: [ConfigModule],
  providers: [
    AiService,
    {
      provide: GEMINI_PROVIDER,
      useFactory: (): IAiProvider | null => {
        try {
          return new GeminiProvider(new (require('@nestjs/config').ConfigService)());
        } catch {
          return null;
        }
      },
    },
    {
      provide: OPENAI_PROVIDER,
      useFactory: (): IAiProvider | null => {
        try {
          return new OpenAiProvider(new (require('@nestjs/config').ConfigService)());
        } catch {
          return null;
        }
      },
    },
  ],
  exports: [AiService],
})
export class AiModule {}
