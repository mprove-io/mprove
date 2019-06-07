import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function makeSourceEpoch(item: {
  field: interfaces.FieldExt;
  connection: api.ProjectConnectionEnum;
}) {
  let ts;

  if (item.connection === api.ProjectConnectionEnum.BigQuery) {
    ts = `TIMESTAMP_SECONDS(${item.field.sql})`;
  } else if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    ts = `TIMESTAMP 'epoch' + (${item.field.sql}) * INTERVAL '1 second'`;
  }

  return ts;
}
