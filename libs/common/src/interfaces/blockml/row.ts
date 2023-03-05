import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { Mconfig } from './mconfig';
import { Query } from './query';
import { Rq } from './rq';

export class Row {
  @IsString()
  rowId: string;

  @IsString()
  name: string;

  @IsEnum(enums.RowTypeEnum)
  rowType: enums.RowTypeEnum;

  @IsString()
  metricId: string;

  @IsString()
  topLabel: string;

  @IsString()
  partLabel: string;

  @IsString()
  timeLabel: string;

  params: any[];

  @IsBoolean()
  hasAccessToModel: boolean;

  @ValidateNested()
  @Type(() => Mconfig)
  mconfig: Mconfig;

  @ValidateNested()
  @Type(() => Query)
  query: Query;

  formula: string;

  formulaDeps: string[];

  showChart: boolean;

  @ValidateNested()
  @Type(() => Rq)
  rqs: Rq[];

  records: any[];

  @IsString()
  formatNumber: string;

  @IsString()
  currencyPrefix: string;

  @IsString()
  currencySuffix: string;
}
