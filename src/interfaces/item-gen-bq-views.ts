import { api } from '../barrels/api';
import { BqView } from './bq-view';

export interface ItemGenBqViews {

  bq_views: BqView[];

  filters_fractions: {
    [s: string]: api.Fraction[]
  };
}