import { api } from '../barrels/api';
import { BqView } from './bq-view';

export interface ItemGenBqViews {
  bqViews: BqView[];

  filtersFractions: {
    [s: string]: api.Fraction[];
  };
}
