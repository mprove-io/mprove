import { common } from '~blockml/barrels/common';

let func = common.FuncEnum.ProcessTimezone;

export function processTimezone(item: {
  mainQuery: common.VarsSql['mainQuery'];
  timezone: common.VarsSql['timezone'];
  varsSqlSteps: common.FilePartReport['varsSqlSteps'];
  model: common.FileModel;
}) {
  let { mainQuery, timezone, varsSqlSteps, model } = item;

  let varsInput = common.makeCopy<common.VarsSql>({
    mainQuery,
    timezone
  });

  let mainQueryProcessed: common.VarsSql['mainQueryProcessed'] = [];

  mainQueryProcessed = mainQuery.map(x => {
    let reg = common.MyRegex.TIMESTAMP_START_END();
    let r;

    while ((r = reg.exec(x))) {
      let one = r[1];
      let two = r[2];
      let three = r[3];

      if (timezone !== common.UTC) {
        switch (model.connection.type) {
          case common.ConnectionTypeEnum.BigQuery: {
            two = `TIMESTAMP(FORMAT_TIMESTAMP('%F %T', ${two}, '${timezone}'))`;
            break;
          }

          case common.ConnectionTypeEnum.PostgreSQL: {
            two = `TIMEZONE('${timezone}', ${two}::TIMESTAMPTZ)`;
            break;
          }

          case common.ConnectionTypeEnum.ClickHouse: {
            two = `toTimezone(${two}, '${timezone}')`;
            break;
          }

          case common.ConnectionTypeEnum.SnowFlake: {
            two = `CONVERT_TIMEZONE('UTC', '${timezone}', ${two})`;
            break;
          }
        }
      }
      x = one + two + three;
    }
    return x;
  });

  let varsOutput: common.VarsSql = { mainQueryProcessed };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
