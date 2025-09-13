import { IsString } from 'class-validator';

export class ConnectionOptionsHeader {
  @IsString()
  key: string;

  @IsString()
  value: string;
}
