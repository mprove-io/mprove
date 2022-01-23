import { Viz } from '../blockml/viz';
import { ReportX } from './report-x';

export class VizX extends Viz {
  author?: string;
  canEditOrDeleteViz?: boolean;
  reports: ReportX[];
}
