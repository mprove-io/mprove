import { api } from '~/barrels/api';

export function makeMeasureMin(item: {
  sqlFinal: string;
  connection: api.ProjectConnection;
}) {
  let { connection, sqlFinal } = item;

  let sqlSelect = `MIN(${sqlFinal})`;

  return sqlSelect;
}
