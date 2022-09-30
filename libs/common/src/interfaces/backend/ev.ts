import { IsString } from 'class-validator';

export class Ev {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  evId: string;

  @IsString()
  value: string;
}
