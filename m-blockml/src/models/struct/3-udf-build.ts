import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { barUdf } from '../../barrels/bar-udf';
import { BmError } from '../bm-error';

export function udfBuild(item: {
  udfs: interfaces.Udf[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let udfsDict: interfaces.UdfsDict = barUdf.makeUdfsDict({
    udfsUser: item.udfs,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return udfsDict;
}
