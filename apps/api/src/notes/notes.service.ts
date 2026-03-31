import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto, NoteResponseDto, NoteDetailResponseDto } from './dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateNoteDto): Promise<NoteResponseDto> {
    const note = await this.prisma.note.create({
      data: { userId, topic: dto.topic, rawNote: dto.rawNote },
    });
    return this.mapToResponse(note);
  }

  async findAll(userId: string): Promise<NoteResponseDto[]> {
    const notes = await this.prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        expansions: { take: 1, orderBy: { createdAt: 'desc' } },
        quizzes: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
    return notes.map((n) => this.mapToResponse(n));
  }

  async findOne(userId: string, noteId: string): Promise<NoteDetailResponseDto> {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId },
      include: {
        expansions: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const response: NoteDetailResponseDto = {
      id: note.id,
      topic: note.topic,
      rawNote: note.rawNote,
      hasExpansion: note.expansions.length > 0,
      hasQuiz: false,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };

    if (note.expansions[0]) {
      response.expansion = {
        id: note.expansions[0].id,
        structuredContent: note.expansions[0].structuredContent as any,
        schemaVersion: note.expansions[0].schemaVersion,
        createdAt: note.expansions[0].createdAt.toISOString(),
      };
    }
    return response;
  }

  async update(
    userId: string,
    noteId: string,
    dto: UpdateNoteDto,
  ): Promise<NoteResponseDto> {
    await this.prisma.note.findFirstOrThrow({
      where: { id: noteId, userId },
    });

    const note = await this.prisma.note.update({
      where: { id: noteId },
      data: {
        ...(dto.topic && { topic: dto.topic }),
        ...(dto.rawNote && { rawNote: dto.rawNote }),
      },
      include: {
        expansions: { take: 1, orderBy: { createdAt: 'desc' } },
        quizzes: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
    return this.mapToResponse(note);
  }

  async delete(userId: string, noteId: string): Promise<void> {
    await this.prisma.note.findFirstOrThrow({
      where: { id: noteId, userId },
    });
    await this.prisma.note.delete({ where: { id: noteId } });
  }

  private mapToResponse(note: any): NoteResponseDto {
    return {
      id: note.id,
      topic: note.topic,
      rawNote: note.rawNote,
      hasExpansion: note.expansions?.length > 0,
      hasQuiz: note.quizzes?.length > 0,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }
}
