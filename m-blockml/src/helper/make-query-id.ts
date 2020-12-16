import * as crypto from 'crypto';
import { api } from '../barrels/api';

export function makeQueryId(item: {
  sql: string[];
  organizationId: string;
  projectId: string;
  connection: api.ProjectConnection;
}) {
  let { sql, organizationId, projectId, connection } = item;

  let sqlString = sql.join('\n');

  let text =
    sqlString + organizationId + projectId + connection.name + connection.type;

  const hash = crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');

  return hash;
}
