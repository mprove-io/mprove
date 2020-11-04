import * as apiEnums from '../../enums/_index';
import { Fraction } from './fraction';

export class DashboardField {
  id: string;
  hidden: boolean;
  label: string;
  result: apiEnums.DashboardFieldResultEnum;
  fractions: Fraction[];
  description?: string;
  fromField?: string;
}
