import { IsString } from 'class-validator';

export class ConnectionHeader {
  @IsString()
  key: string;

  @IsString()
  value: string;
}
