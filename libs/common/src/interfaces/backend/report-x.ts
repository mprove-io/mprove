import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Mconfig } from '../blockml/mconfig';
import { Query } from '../blockml/query';
import { Report } from '../blockml/report';

export class ReportX extends Report {
  @IsOptional()
  @ValidateNested()
  @Type(() => Mconfig)
  mconfig?: Mconfig;

  @IsOptional()
  @ValidateNested()
  @Type(() => Query)
  query?: Query;

  @IsBoolean()
  hasAccessToModel: boolean;
}
