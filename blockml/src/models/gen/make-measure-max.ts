import { api } from '../../barrels/api';

export function makeMeasureMax(item: {
  sql_final: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sqlSelect = `MAX(${item.sql_final})`;

  return sqlSelect;
}
