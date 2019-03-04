import { Fraction } from './fraction';

export interface Filter {
  field_id: string;
  fractions: Fraction[];
}
