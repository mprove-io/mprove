import { common } from '~blockml/barrels/common';

export function makeMeasureCountDistinct(item: {
  sqlFinal: string;
  connection: common.ProjectConnection;
}) {
  let { connection, sqlFinal } = item;

  let sqlSelect = `COUNT(DISTINCT ${sqlFinal})`;

  return sqlSelect;
}
