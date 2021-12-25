import { common } from '~blockml/barrels/common';

export function makeMeasureSum(item: {
  sqlFinal: string;
  connection: common.ProjectConnection;
}) {
  let { connection, sqlFinal } = item;

  let sqlSelect = `COALESCE(SUM(${sqlFinal}), 0)`;

  return sqlSelect;
}
