import { AmError } from '../barrels/am-error';
import { Udf } from './udf';
import { View } from './view';
import { Model } from './model';
import { Dashboard } from './dashboard';
import { Pdt } from './pdt';

export interface Struct {
  errors: AmError[];
  udfs: Udf[];
  views: View[];
  models: Model[];
  dashboards: Dashboard[];
  pdts: Pdt[];
  pdts_sorted: string[];
}
