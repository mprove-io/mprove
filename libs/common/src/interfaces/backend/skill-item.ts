import { IsString } from 'class-validator';

export class SkillItem {
  @IsString()
  name: string;

  @IsString()
  content: string;
}
