import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { NotesModule } from '../notes/notes.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [NotesModule, AiModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
