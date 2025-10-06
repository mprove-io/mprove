import { IsString } from 'class-validator';

export class ApiHeader {
  @IsString()
  key: string;

  @IsString()
  value: string;
}
