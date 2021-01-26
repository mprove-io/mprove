import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { barUdf } from '~/barrels/bar-udf';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';
import { BmError } from '~/models/bm-error';

export function buildUdf(
  item: {
    udfs: interfaces.Udf[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let udfsDict: api.UdfsDict = barUdf.makeUdfsDict(
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
