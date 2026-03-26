import { IsString } from 'class-validator';

export class StateReportItem {
  @IsString()
  reportId: string;

  @IsString()
  url: string;
}
