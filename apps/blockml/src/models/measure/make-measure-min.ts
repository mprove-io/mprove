import { common } from '~blockml/barrels/common';

export function makeMeasureMin(item: {
  sqlFinal: string;
  connection: common.ProjectConnection;
}) {
  let { connection, sqlFinal } = item;

  let sqlSelect = `MIN(${sqlFinal})`;

  return sqlSelect;
}
