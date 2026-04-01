import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { IAiProvider } from "./ai-provider.interface";
import { GEMINI_PROVIDER, OPENAI_PROVIDER } from "./ai.constants";
import { AiService } from "./ai.service";
import { GeminiProvider } from "./gemini.provider";
import { OpenAiProvider } from "./openai.provider";

@Module({
  imports: [ConfigModule],
  providers: [
    AiService,
    {
      provide: GEMINI_PROVIDER,
      useFactory: (configService: ConfigService): IAiProvider | null => {
        const apiKey = configService.get<string>("GEMINI_API_KEY");
        if (!apiKey) {
          return null;
        }
        try {
          return new GeminiProvider(configService);
        } catch {
          return null;
        }
      },
      inject: [ConfigService],
    },
    {
      provide: OPENAI_PROVIDER,
      useFactory: (configService: ConfigService): IAiProvider | null => {
        const apiKey = configService.get<string>("OPENAI_API_KEY");
        if (!apiKey) {
          return null;
        }
        try {
          return new OpenAiProvider(configService);
        } catch {
          return null;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [AiService],
})
export class AiModule {}
