import { ConfigService } from '@nestjs/config';
import { barUdf } from '~blockml/barrels/bar-udf';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildUdf(
  item: {
    udfs: interfaces.Udf[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let udfsDict: common.UdfsDict = barUdf.makeUdfsDict(
    {
      udfsUser: item.udfs,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return udfsDict;
}
