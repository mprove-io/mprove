import { api } from '../../barrels/api';

export function makeMeasureMin(item: {
  sql_final: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sqlSelect = `MIN(${item.sql_final})`;

  return sqlSelect;
}
