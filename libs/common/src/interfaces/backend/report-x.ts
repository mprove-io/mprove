import { IsBoolean, IsString } from 'class-validator';
import { Report } from '../blockml/report';

export class ReportX extends Report {
  @IsString()
  author: string;

  @IsBoolean()
  canEditOrDeleteReport: boolean;
}
