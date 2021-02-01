import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.MakeUdfsDict;

export function makeUdfsDict(
  item: {
    udfsUser: interfaces.Udf[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let udfsDict: api.UdfsDict = {};

  item.udfsUser.forEach(u => {
    udfsDict[u.name] = u.sql;
  });

  let udfArraySum = `${constants.CREATE_TEMPORARY_FUNCTION} ${constants.UDF_MPROVE_ARRAY_SUM}(ar ARRAY<STRING>) AS
  ((SELECT SUM(CAST(REGEXP_EXTRACT(val, '\\\\|\\\\|(\\\\-?\\\\d+(?:.\\\\d+)?)\$') AS FLOAT64)) FROM UNNEST(ar) as val));`;

  let udfAPDD = `${constants.CREATE_TEMPORARY_FUNCTION} ${constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC}(a_num ARRAY<STRING>, fraction FLOAT64) RETURNS FLOAT64 AS
  ((
  SELECT
    MAX(num1)
  FROM (
    SELECT
      row_number() OVER (ORDER BY CAST(REGEXP_EXTRACT(num, '\\\\|\\\\|(\\\\-?\\\\d+(?:.\\\\d+)?)\$') AS FLOAT64)) - 1 as rn
      , CAST(REGEXP_EXTRACT(num, '\\\\|\\\\|(\\\\-?\\\\d+(?:.\\\\d+)?)\$') AS FLOAT64) as num1
    FROM UNNEST(a_num) num
    )
    WHERE
      rn = CEIL(ARRAY_LENGTH(a_num) * fraction) - 1
  ));`;

  udfsDict[constants.UDF_MPROVE_ARRAY_SUM] = udfArraySum;

  udfsDict[constants.UDF_MPROVE_APPROX_PERCENTILE_DISTINCT_DISC] = udfAPDD;

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.UdfsDict, udfsDict);

  return udfsDict;
}
