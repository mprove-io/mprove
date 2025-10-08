import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { ReportField } from '~common/interfaces/blockml/report-field';
import { Row } from '~common/interfaces/blockml/row';
import { ReportEnt } from '../schema/reports';

export interface ReportTab
  extends Omit<ReportEnt, 'st' | 'lt'>,
    ReportSt,
    ReportLt {}

export class ReportSt {
  filePath: string;
  accessRoles: string[];
  title: string;
  fields: ReportField[];
  chart: MconfigChart;
}

export class ReportLt {
  rows: Row[];
}
