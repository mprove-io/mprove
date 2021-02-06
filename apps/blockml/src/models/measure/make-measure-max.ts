import { common } from '~blockml/barrels/common';

export function makeMeasureMax(item: {
  sqlFinal: string;
  connection: common.ProjectConnection;
}) {
  let { connection, sqlFinal } = item;

  let sqlSelect = `MAX(${sqlFinal})`;

  return sqlSelect;
}
