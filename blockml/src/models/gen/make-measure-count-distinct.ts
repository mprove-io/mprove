import { api } from '../../barrels/api';

export function makeMeasureCountDistinct(item: {
  sql_final: string;
  connection: api.ProjectConnectionEnum;
}) {
  let sqlSelect = `COUNT(DISTINCT ${item.sql_final})`;

  return sqlSelect;
}
