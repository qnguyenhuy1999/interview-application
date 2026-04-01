export interface AiPromptResult {
  content: string;
}

export interface IAiProvider {
  readonly name: string;
  chat(systemPrompt: string, userPrompt: string): Promise<AiPromptResult>;
  isRateLimitError(error: unknown): boolean;
}
