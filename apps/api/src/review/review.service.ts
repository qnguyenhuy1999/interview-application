import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getReviewQueue(userId: string) {
    const now = new Date();

    const items = await this.prisma.reviewQueue.findMany({
      where: {
        note: { userId },
        nextReviewAt: { lte: now },
        status: 'active',
      },
      include: { note: true },
      orderBy: { nextReviewAt: 'asc' },
    });

    this.logger.log(
      `Fetched ${items.length} review items for user ${userId}`,
    );

    return {
      items: items.map((item) => ({
        id: item.id,
        noteId: item.noteId,
        topic: item.note.topic,
        missingConcepts: [],
        weaknessLevel: item.weaknessLevel,
        nextReviewAt: item.nextReviewAt.toISOString(),
        status: item.status,
      })),
    };
  }

  async updateAfterQuiz(
    noteId: string,
    score: number,
    missingConcepts: string[],
  ) {
    const existing = await this.prisma.reviewQueue.findFirst({
      where: { noteId },
    });

    const weaknessLevel = existing?.weaknessLevel ?? 0;
    let newWeaknessLevel = weaknessLevel;
    let streak = existing?.streak ?? 0;
    let daysUntilReview = 1;

    if (score >= 8) {
      streak += 1;
      daysUntilReview = streak >= 2 ? 7 : 4;
    } else if (score < 5) {
      newWeaknessLevel = Math.min(weaknessLevel + 1, 5);
      streak = 0;
      daysUntilReview = 1;
    } else {
      streak = 0;
      daysUntilReview = 1;
    }

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + daysUntilReview);

    if (existing) {
      await this.prisma.reviewQueue.update({
        where: { id: existing.id },
        data: {
          nextReviewAt,
          weaknessLevel: newWeaknessLevel,
          streak,
        },
      });
    } else {
      await this.prisma.reviewQueue.create({
        data: {
          noteId,
          nextReviewAt,
          weaknessLevel: newWeaknessLevel,
          streak,
          status: 'active',
        },
      });
    }

    this.logger.log(
      `Updated review for note ${noteId}: score=${score}, nextReview=${nextReviewAt.toISOString()}`,
    );
  }
}
