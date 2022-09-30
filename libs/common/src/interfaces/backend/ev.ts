import { IsString } from 'class-validator';

export class Ev {
  @IsString()
  envId: string;

  @IsString()
  projectId: string;

  @IsString()
  evId: string;

  @IsString()
  value: string;
}
