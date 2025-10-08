import { IsOptional, IsString } from 'class-validator';
import { NoteEnt } from '../schema/notes';

export interface NoteTab extends Omit<NoteEnt, 'st' | 'lt'> {
  st: NoteSt;
  lt: NoteLt;
}

export class NoteSt {
  emptyData?: number;
}

export class NoteLt {
  @IsOptional()
  @IsString()
  privateKey: string;

  @IsOptional()
  @IsString()
  publicKey: string;
}
