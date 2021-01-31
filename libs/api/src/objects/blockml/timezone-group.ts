import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Timezone } from './timezone';

export class TimezoneGroup {
  @IsString()
  group: string;

  @ValidateNested()
  @Type(() => Timezone)
  zones: Timezone[];
}
