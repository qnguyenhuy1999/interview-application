import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { ReviewModule } from '../review/review.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule, ReviewModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
