import { IsString } from 'class-validator';

export class ProjectTab {
  @IsString()
  privateKey: string;

  @IsString()
  publicKey: string;
}
