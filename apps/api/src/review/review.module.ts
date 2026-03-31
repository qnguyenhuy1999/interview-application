import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { QuizModule } from '../quiz/quiz.module';

@Module({
  imports: [QuizModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
