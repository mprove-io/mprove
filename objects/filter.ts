import * as api from '../_index';

export interface Filter {
  field_id: string;
  fractions: Array<api.Fraction>;
}