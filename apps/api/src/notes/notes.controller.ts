import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { NotesService } from './notes.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto, NoteResponseDto, NoteDetailResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateNoteDto,
  ): Promise<NoteResponseDto> {
    return this.notesService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: { id: string }): Promise<NoteResponseDto[]> {
    return this.notesService.findAll(user.id);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<NoteDetailResponseDto> {
    return this.notesService.findOne(user.id, id);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ): Promise<NoteResponseDto> {
    return this.notesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<void> {
    return this.notesService.delete(user.id, id);
  }

  @Post(':id/deep-dive')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async generateDeepDive(
    @CurrentUser() user: { id: string },
    @Param('id') noteId: string,
  ): Promise<any> {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId: user.id },
    });

    if (!note) {
      throw new Error('Note not found');
    }

    const structuredContent = await this.aiService.generateDeepDive(note.rawNote);

    const expansion = await this.prisma.noteExpansion.create({
      data: {
        noteId,
        structuredContent,
        schemaVersion: '1.0',
      },
    });

    return {
      expansion: {
        id: expansion.id,
        structuredContent: expansion.structuredContent,
        schemaVersion: expansion.schemaVersion,
        createdAt: expansion.createdAt.toISOString(),
      },
    };
  }
}
