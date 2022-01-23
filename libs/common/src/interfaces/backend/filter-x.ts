import { Filter } from '../blockml/filter';

export class FilterX extends Filter {
  // @ValidateNested()
  // @Type(() => MconfigField)
  field: any; // ModelField, DashboardField
}
