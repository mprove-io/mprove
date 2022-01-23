import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Query } from '../blockml/query';
import { Report } from '../blockml/report';
import { MconfigX } from './mconfig-x';

export class ReportX extends Report {
  @IsOptional()
  @ValidateNested()
  @Type(() => MconfigX)
  mconfig?: MconfigX;

  @IsOptional()
  @ValidateNested()
  @Type(() => Query)
  query?: Query;

  @IsBoolean()
  hasAccessToModel: boolean;
}
