import { Udf } from './udf';
import { View } from './view';
import { Model } from './model';
import { Dashboard } from './dashboard';
import { BmError } from '../models/bm-error';
import { Visualization } from './visualization';

export interface Struct {
  errors: BmError[];

  udfs: Udf[];
  views: View[];
  models: Model[];
  dashboards: Dashboard[];
  visualizations: Visualization[];

  // pdts: Pdt[];
  // pdtsSorted: string[];
}
