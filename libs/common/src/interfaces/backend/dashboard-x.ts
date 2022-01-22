import { Dashboard } from '../blockml/dashboard';
import { FilterX } from './filter-x';
import { ReportX } from './report-x';

export class DashboardX extends Dashboard {
  extendedFilters: FilterX[];
  reports: ReportX[];
  author?: string;
  canEditOrDeleteDashboard?: boolean;
}
