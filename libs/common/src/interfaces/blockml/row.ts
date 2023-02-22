import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Mconfig } from './mconfig';
import { Query } from './query';
import { Rq } from './rq';

export class Row {
  @IsString()
  rowId: string;

  @IsString()
  metricId: string;

  @ValidateNested()
  @Type(() => Rq)
  rqs: Rq[];

  @ValidateNested()
  @Type(() => Mconfig)
  mconfig: Mconfig;

  @IsBoolean()
  hasAccessToModel: boolean;

  @ValidateNested()
  @Type(() => Query)
  query: Query;

  params: any[];

  formula: string;

  formulaDeps: string[];

  showChart: boolean;

  records: any[];

  @IsString()
  formatNumber: string;

  @IsString()
  currencyPrefix: string;

  @IsString()
  currencySuffix: string;
}
