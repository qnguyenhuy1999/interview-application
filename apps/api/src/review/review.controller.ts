import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('review')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('queue')
  async getReviewQueue(@CurrentUser() user: { id: string }) {
    return this.reviewService.getReviewQueue(user.id);
  }
}
