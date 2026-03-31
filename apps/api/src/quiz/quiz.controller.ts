import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('generate')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async generateQuiz(
    @CurrentUser() user: { id: string },
    @Body() body: { noteId: string },
  ) {
    return this.quizService.generateQuiz(user.id, body.noteId);
  }

  @Get(':id')
  async getQuiz(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.quizService.getQuiz(user.id, id);
  }

  @Post(':id/submit')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async submitQuiz(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: { answers: { questionIndex: number; answer: string }[] },
  ) {
    return this.quizService.submitQuiz(user.id, id, body.answers);
  }
}
