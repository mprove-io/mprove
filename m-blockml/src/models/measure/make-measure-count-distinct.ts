import { api } from '~/barrels/api';

export function makeMeasureCountDistinct(item: {
  sqlFinal: string;
  connection: api.ProjectConnection;
}) {
  let { connection, sqlFinal } = item;

  let sqlSelect = `COUNT(DISTINCT ${sqlFinal})`;

  return sqlSelect;
}
