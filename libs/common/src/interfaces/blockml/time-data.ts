import { IsString } from 'class-validator';

export class TimeData {
  @IsString()
  timestamp: number; // SELECT ... as value, ... as timestamp

  @IsString()
  value: number;
}
