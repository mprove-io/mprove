import { ConfigService } from '@nestjs/config';
import { barUdf } from '~blockml/barrels/bar-udf';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildUdf(
  item: {
    udfs: common.FileUdf[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let udfsDict: common.FileUdfsDict = barUdf.makeUdfsDict(
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
