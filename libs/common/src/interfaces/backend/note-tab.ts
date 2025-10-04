import { IsOptional, IsString } from 'class-validator';

export class NoteTab {
  @IsOptional()
  @IsString()
  privateKey: string;

  @IsOptional()
  @IsString()
  publicKey: string;
}
