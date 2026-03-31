import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { QuizModule } from './quiz/quiz.module';
import { ReviewModule } from './review/review.module';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'ai',
        ttl: 60000,
        limit: 5,
      },
    ]),
    PrismaModule,
    AuthModule,
    NotesModule,
    QuizModule,
    ReviewModule,
    AiModule,
  ],
})
export class AppModule {}
