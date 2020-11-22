import { api } from '../../barrels/api';

export function makeMeasureMax(item: {
  sqlFinal: string;
  connection: api.ProjectConnection;
}) {
  let { connection, sqlFinal } = item;

  let sqlSelect = `MAX(${sqlFinal})`;

  return sqlSelect;
}
