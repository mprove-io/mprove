import { IsString } from 'class-validator';

export class Env {
  @IsString()
  envId: string;

  @IsString()
  projectId: string;
}
