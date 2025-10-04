import { IsOptional, IsString } from 'class-validator';

export class ProjectTab {
  @IsOptional()
  @IsString()
  privateKey: string;

  @IsOptional()
  @IsString()
  publicKey: string;
}
