import { IsInt, IsString } from 'class-validator';

export class Project {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  name: string;

  @IsInt()
  serverTs: number;
}
