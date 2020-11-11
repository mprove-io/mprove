import { BmError } from '../models/bm-error';
import { Udf } from './file-types/udf';
import { View } from './file-types/view';
import { Model } from './file-types/model';
import { Dashboard } from './file-types/dashboard';
import { Visualization } from './file-types/visualization';

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
