import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { barUdf } from '../../barrels/bar-udf';
import { BmError } from '../bm-error';
import { api } from '../../barrels/api';

export function buildUdf(item: {
  udfs: interfaces.Udf[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let udfsDict: api.UdfsDict = barUdf.makeUdfsDict({
    udfsUser: item.udfs,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return udfsDict;
}
