import { BmError } from '../models/bm-error';
import { Udf } from './file-types/udf';
import { View } from './file-types/view';
import { Model } from './file-types/model';
import { Dashboard } from './file-types/dashboard';
import { Viz } from './file-types/viz';
import { UdfsDict } from './udfs-dict';

export interface Struct {
  errors: BmError[];
  udfsDict: UdfsDict;
  views: View[];
  models: Model[];
  dashboards: Dashboard[];
  vizs: Viz[];
}
