import { IsString } from 'class-validator';

export class EnvsItem {
  @IsString()
  envId: string;

  @IsString()
  projectId: string;
}
