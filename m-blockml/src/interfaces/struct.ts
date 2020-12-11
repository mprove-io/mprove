import { BmError } from '../models/bm-error';
import { api } from '../barrels/api';
import { View } from './file-types/view';
import { Model } from './file-types/model';
import { Dashboard } from './file-types/dashboard';
import { Viz } from './file-types/viz';

export interface Struct {
  errors: BmError[];
  udfsDict: api.UdfsDict;
  views: View[];
  models: Model[];
  dashboards: Dashboard[];
  vizs: Viz[];
}
