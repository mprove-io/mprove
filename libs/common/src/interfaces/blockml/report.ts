import { IsNumber, IsString } from 'class-validator';
import { IsTimezone } from '~common/functions/is-timezone';

export class Report {
  @IsString()
  modelId: string;

  @IsString()
  modelLabel: string;

  @IsString()
  mconfigId: string;

  @IsTimezone()
  timezone: string;

  @IsString()
  queryId: string;

  listen: { [a: string]: string };

  @IsString()
  title: string;

  @IsNumber()
  tileWidth: number;

  @IsNumber()
  tileHeight: number;

  @IsNumber()
  tileX: number;

  @IsNumber()
  tileY: number;
}
