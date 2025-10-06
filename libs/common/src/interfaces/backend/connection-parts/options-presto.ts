import { IsInt, IsOptional } from 'class-validator';
import { OptionsPrestoTrinoCommon } from './options-presto-trino-common';

export class OptionsPresto extends OptionsPrestoTrinoCommon {
  @IsOptional()
  @IsInt()
  port?: number;
}
