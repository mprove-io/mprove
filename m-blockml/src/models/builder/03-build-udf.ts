import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';
import { barUdf } from '~/barrels/bar-udf';
import { BmError } from '~/models/bm-error';
import { api } from '~/barrels/api';
import { ConfigService } from '@nestjs/config';

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
