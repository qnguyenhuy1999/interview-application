import { Inject, Injectable, Logger } from "@nestjs/common";
import { IAiProvider } from "./ai-provider.interface";
import { GEMINI_PROVIDER, OPENAI_PROVIDER } from "./ai.constants";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly primary: IAiProvider | null;
  private readonly fallback: IAiProvider | null;

  constructor(
    @Inject(GEMINI_PROVIDER)
    private readonly geminiProvider: IAiProvider | null,
    @Inject(OPENAI_PROVIDER)
    private readonly openAiProvider: IAiProvider | null,
  ) {
    this.primary = this.geminiProvider ?? this.openAiProvider;
    this.fallback =
      this.geminiProvider && this.openAiProvider ? this.openAiProvider : null;

    const hasGemini = !!this.geminiProvider;
    const hasOpenAI = !!this.openAiProvider;

    if (!hasGemini && !hasOpenAI) {
      this.logger.error(
        "No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.",
      );
    } else if (!hasGemini) {
      this.logger.warn("Gemini not configured, falling back to OpenAI only.");
    } else if (!hasOpenAI) {
      this.logger.warn("OpenAI not configured as fallback.");
    }

    this.logger.log(
      `AI providers — primary: ${this.primary?.name ?? "none"}, fallback: ${this.fallback?.name ?? "none"}`,
    );
  }

  private async callAi<T>(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<T> {
    if (!this.primary) {
      throw new Error("No AI provider configured");
    }

    try {
      return await this.attempt<T>(this.primary, systemPrompt, userPrompt);
    } catch (primaryErr) {
      if (this.primary.isRateLimitError(primaryErr) && this.fallback) {
        this.logger.warn(
          `Primary provider (${this.primary.name}) hit rate limit, switching to fallback (${this.fallback.name})`,
        );
        return await this.attempt<T>(this.fallback, systemPrompt, userPrompt);
      }
      throw primaryErr;
    }
  }

  private async attempt<T>(
    provider: IAiProvider,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<T> {
    if (!provider) {
      throw new Error("No AI provider available");
    }
    const { content } = await provider.chat(systemPrompt, userPrompt);
    return JSON.parse(content) as T;
  }

  async generateDeepDive(
    noteContent: string,
  ): Promise<Record<string, unknown>> {
    const systemPrompt = `You are a Senior Software Architect and Technical Interviewer.

Your task is to explain technical concepts at a Senior Fullstack Developer level.

Rules:
- Be technically precise.
- Avoid fluff.
- Provide structured explanations.
- Include practical examples.
- Include trade-offs.
- Include real-world production considerations.
- Include common interview traps.
- Do not hallucinate unknown facts.
- If topic is ambiguous, clearly state assumptions.
- Return ONLY valid JSON matching this exact structure.`;

    const userPrompt = `Topic: ${noteContent}

Context: I am preparing for a Senior Fullstack Developer interview.

Generate a structured deep-dive explanation using this exact JSON format:
{
  "definition": "...",
  "whyItExists": "...",
  "coreConcepts": ["...", "..."],
  "internalMechanics": "...",
  "codeExample": "...",
  "performanceConsiderations": "...",
  "tradeoffs": ["...", "..."],
  "commonInterviewQuestions": ["...", "..."],
  "realWorldExample": "...",
  "commonMistakes": ["...", "..."]
}`;

    return this.callAi(systemPrompt, userPrompt);
  }

  async generateQuiz(
    noteContent: string,
    aiExplanation?: string,
  ): Promise<{ questions: unknown[] }> {
    const explanationContext = aiExplanation
      ? `Explanation:\n${aiExplanation}\n\n`
      : "";

    const systemPrompt = `You are a Senior Technical Interviewer.

Generate high-quality interview questions.

Rules:
- Questions must test deep understanding.
- Avoid trivial or memorization-only questions.
- Include scenario-based questions.
- At least one hard-difficulty question.
- Return ONLY valid JSON matching this exact format:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B",
      "difficulty": "medium"
    },
    {
      "type": "open_ended",
      "question": "...",
      "expectedKeyPoints": ["point1", "point2"],
      "difficulty": "hard"
    }
  ]
}
- At least 2 scenario-based questions.
- At least 1 hard-difficulty question.
- Ensure JSON is valid.`;

    const userPrompt = `Topic: ${noteContent}

${explanationContext}Generate 5 questions in the exact JSON format specified.`;

    return this.callAi(systemPrompt, userPrompt);
  }

  async gradeAnswer(
    question: string,
    expectedKeyPoints: string[],
    userAnswer: string,
  ): Promise<{ score: number; missingConcepts: string[]; feedback: string }> {
    const systemPrompt = `You are a strict Senior Technical Interviewer.

Evaluate answers critically.

Rules:
- Be objective.
- Do not over-score.
- Identify missing concepts.
- Identify incorrect statements.
- Return ONLY valid JSON matching this exact format:
{
  "score": 0-10,
  "missing_concepts": ["concept1", "concept2"],
  "feedback": "Short constructive feedback"
}`;

    const userPrompt = `Question: ${question}

Expected Key Points: ${expectedKeyPoints.join(", ")}

User Answer: ${userAnswer}

Evaluate using this JSON format:
{
  "score": 0-10,
  "missing_concepts": ["concept1", "concept2"],
  "feedback": "Short constructive feedback"
}`;

    const result = await this.callAi<{
      score: number;
      missing_concepts: string[];
      feedback: string;
    }>(systemPrompt, userPrompt);

    return {
      score: result.score,
      missingConcepts: result.missing_concepts ?? [],
      feedback: result.feedback ?? "",
    };
  }
}
