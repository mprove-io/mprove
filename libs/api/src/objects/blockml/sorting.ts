import { IsBoolean, IsString } from 'class-validator';

export class Sorting {
  @IsString()
  fieldId: string;

  @IsBoolean()
  desc: boolean;
}
