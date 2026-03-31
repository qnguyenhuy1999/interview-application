import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateDeepDive(noteContent: string): Promise<Record<string, any>> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a Senior Software Architect and Technical Interviewer.

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
- Return ONLY valid JSON matching this exact structure.`,
        },
        {
          role: 'user',
          content: `Topic: ${noteContent}

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
}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI returned empty response');
    }

    try {
      return JSON.parse(content);
    } catch {
      throw new Error('AI returned invalid JSON');
    }
  }

  async generateQuiz(
    noteContent: string,
    aiExplanation?: string,
  ): Promise<{ questions: any[] }> {
    const explanationContext = aiExplanation
      ? `Explanation:\n${aiExplanation}\n\n`
      : '';

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a Senior Technical Interviewer.

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
- Ensure JSON is valid.`,
        },
        {
          role: 'user',
          content: `Topic: ${noteContent}

${explanationContext}Generate 5 questions in the exact JSON format specified.`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI returned empty response');
    }

    try {
      return JSON.parse(content);
    } catch {
      throw new Error('AI returned invalid JSON');
    }
  }

  async gradeAnswer(
    question: string,
    expectedKeyPoints: string[],
    userAnswer: string,
  ): Promise<{ score: number; missingConcepts: string[]; feedback: string }> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a strict Senior Technical Interviewer.

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
}`,
        },
        {
          role: 'user',
          content: `Question: ${question}

Expected Key Points: ${expectedKeyPoints.join(', ')}

User Answer: ${userAnswer}

Evaluate using this JSON format:
{
  "score": 0-10,
  "missing_concepts": ["concept1", "concept2"],
  "feedback": "Short constructive feedback"
}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI returned empty response');
    }

    try {
      const result = JSON.parse(content);
      return {
        score: result.score,
        missingConcepts: result.missing_concepts || [],
        feedback: result.feedback || '',
      };
    } catch {
      throw new Error('AI returned invalid JSON');
    }
  }
}
