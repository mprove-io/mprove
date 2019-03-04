import { SwError } from './sw-error';
import { Model } from './model';
import { Dashboard } from './dashboard';
import { Mconfig } from './mconfig';
import { Query } from './query';

export interface StructFull {
  errors: SwError[];
  models: Model[];
  dashboards: Dashboard[];
  mconfigs: Mconfig[];
  queries: Query[];
}
