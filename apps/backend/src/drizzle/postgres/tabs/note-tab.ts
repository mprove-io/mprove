import { NoteEnt } from '../schema/notes';

export interface NoteTab extends Omit<NoteEnt, 'st' | 'lt'>, NoteSt, NoteLt {}

export class NoteSt {
  emptyData?: number;
}

export class NoteLt {
  privateKey: string;
  publicKey: string;
}
