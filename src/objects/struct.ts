import { SwError } from './sw-error';
import { Model } from './model';
import { Dashboard } from './dashboard';
import { Repo } from './repo';

export interface Struct {
  errors: SwError[];
  models: Model[];
  dashboards: Dashboard[];
  repo: Repo;
}
