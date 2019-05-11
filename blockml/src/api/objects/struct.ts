import { SwError } from './sw-error';
import { Model } from './model';
import { Dashboard } from './dashboard';
import { Repo } from './repo';
import { View } from './view';

export interface Struct {
  errors: SwError[];
  models: Model[];
  views: View[];
  dashboards: Dashboard[];
  repo: Repo;
}
