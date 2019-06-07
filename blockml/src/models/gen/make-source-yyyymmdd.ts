import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeSourceYYYYMMDD(item: {
  field: interfaces.FieldExt;
  connection: api.ProjectConnectionEnum;
}) {
  let ts;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    ts = `PARSE_TIMESTAMP('%Y%m%d', CAST(${item.field.sql} AS STRING))`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    ts = `TO_DATE(${item.field.sql}::VARCHAR, 'YYYYMMDD')::TIMESTAMP`;
  }

  return ts;
}
