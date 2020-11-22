import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { barUdf } from '../../barrels/bar-udf';

export function udfBuild(item: {
  udfs: interfaces.Udf[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let udfsDict: interfaces.UdfsDict = barUdf.makeUdfsDict({
    udfsUser: item.udfs,
    structId: item.structId,
    caller: item.caller
  });

  return udfsDict;
}
