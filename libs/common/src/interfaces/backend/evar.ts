import { IsString } from 'class-validator';

export class Evar {
  @IsString()
  envId: string;

  @IsString()
  projectId: string;

  @IsString()
  evarId: string;

  @IsString()
  value: string;
}
