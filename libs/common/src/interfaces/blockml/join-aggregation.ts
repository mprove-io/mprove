import { IsBoolean, IsString } from 'class-validator';

export class JoinAggregation {
  @IsString()
  joinAs: string;

  @IsBoolean()
  isSafeAggregation: boolean;
}
