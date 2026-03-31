import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class QuizService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generateQuiz(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId },
      include: {
        expansions: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const expansion = note.expansions[0];
    const aiExplanation = expansion
      ? JSON.stringify(expansion.structuredContent)
      : undefined;

    const quizData = await this.aiService.generateQuiz(note.rawNote, aiExplanation);

    const quiz = await this.prisma.quiz.create({
      data: {
        noteId,
        questions: quizData,
        schemaVersion: '1.0',
      },
    });

    return this.mapQuizResponse(quiz);
  }

  async getQuiz(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId },
      include: { note: true },
    });

    if (!quiz || quiz.note.userId !== userId) {
      throw new NotFoundException('Quiz not found');
    }

    return this.mapQuizResponse(quiz);
  }

  async submitQuiz(
    userId: string,
    quizId: string,
    answers: { questionIndex: number; answer: string }[],
  ) {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId },
      include: { note: true },
    });

    if (!quiz || quiz.note.userId !== userId) {
      throw new NotFoundException('Quiz not found');
    }

    const questions = (quiz.questions as any).questions || [];
    const results = [];
    let totalScore = 0;

    for (const submission of answers) {
      const question = questions[submission.questionIndex];
      if (!question) continue;

      let score = 0;
      let missingConcepts: string[] = [];
      let feedback = '';

      if (question.type === 'multiple_choice') {
        const correct = submission.answer.toUpperCase() === question.correctAnswer.toUpperCase();
        score = correct ? 10 : 0;
        feedback = correct ? 'Correct!' : `Incorrect. The correct answer was ${question.correctAnswer}.`;
      } else {
        const graded = await this.aiService.gradeAnswer(
          question.question,
          question.expectedKeyPoints || [],
          submission.answer,
        );
        score = graded.score;
        missingConcepts = graded.missingConcepts;
        feedback = graded.feedback;
      }

      totalScore += score;
      results.push({
        questionIndex: submission.questionIndex,
        score,
        missingConcepts,
        feedback,
      });
    }

    await this.prisma.quizAnswer.create({
      data: {
        quizId,
        userAnswer: JSON.stringify(answers),
        score: totalScore,
        missingConcepts: results.flatMap((r) => r.missingConcepts),
        feedback: JSON.stringify(results),
      },
    });

    return {
      quizId,
      results,
      overallScore: totalScore,
      createdAt: new Date().toISOString(),
    };
  }

  private mapQuizResponse(quiz: any) {
    return {
      id: quiz.id,
      noteId: quiz.noteId,
      questions: (quiz.questions as any).questions || [],
      schemaVersion: quiz.schemaVersion,
      createdAt: quiz.createdAt.toISOString(),
    };
  }
}
