import { SwError } from './sw-error';
import { Model } from './model';
import { Dashboard } from './dashboard';
import { Mconfig } from './mconfig';
import { Query } from './query';
import { View } from './view';

export interface StructFull {
  errors: SwError[];
  models: Model[];
  views: View[];
  dashboards: Dashboard[];
  mconfigs: Mconfig[];
  queries: Query[];
}
