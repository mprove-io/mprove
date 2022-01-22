import { Mconfig } from '../blockml/mconfig';
import { Query } from '../blockml/query';
import { Report } from '../blockml/report';

export class ReportX extends Report {
  mconfig?: Mconfig;
  query?: Query;
  hasAccessToModel?: boolean;
}
