import { IsString, IsOptional } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  topic: string;

  @IsString()
  rawNote: string;
}

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  rawNote?: string;
}

export interface NoteResponseDto {
  id: string;
  topic: string;
  rawNote: string;
  hasExpansion: boolean;
  hasQuiz: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteDetailResponseDto extends NoteResponseDto {
  expansion?: {
    id: string;
    structuredContent: any;
    schemaVersion: string;
    createdAt: string;
  };
}
