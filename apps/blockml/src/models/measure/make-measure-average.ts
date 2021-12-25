import { common } from '~blockml/barrels/common';

export function makeMeasureAverage(item: {
  sqlFinal: string;
  connection: common.ProjectConnection;
}) {
  let { connection, sqlFinal } = item;

  let sqlSelect = `AVG(${sqlFinal})`;

  return sqlSelect;
}
