import { api } from '~blockml/barrels/api';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';

let func = enums.FuncEnum.ProcessTimezone;

export function processTimezone(item: {
  mainQuery: interfaces.VarsSql['mainQuery'];
  timezone: interfaces.VarsSql['timezone'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
}) {
  let { mainQuery, timezone, varsSqlSteps, model } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSql>({
    mainQuery,
    timezone
  });

  let mainQueryProcessed: interfaces.VarsSql['mainQueryProcessed'] = [];

  mainQueryProcessed = mainQuery.map(x => {
    let reg = api.MyRegex.TIMESTAMP_START_END();
    let r;

    while ((r = reg.exec(x))) {
      let one = r[1];
      let two = r[2];
      let three = r[3];

      if (timezone !== constants.UTC) {
        switch (model.connection.type) {
          case api.ConnectionTypeEnum.BigQuery: {
            two = `TIMESTAMP(FORMAT_TIMESTAMP('%F %T', ${two}, '${timezone}'))`;
            break;
          }

          case api.ConnectionTypeEnum.PostgreSQL: {
            two = `TIMEZONE('${timezone}', ${two}::TIMESTAMPTZ)`;
            break;
          }
        }
      }
      x = one + two + three;
    }
    return x;
  });

  let varsOutput: interfaces.VarsSql = { mainQueryProcessed };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
