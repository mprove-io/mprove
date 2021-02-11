import * as crypto from 'crypto';
import { common } from '~blockml/barrels/common';

export function makeQueryId(item: {
  sql: string[];
  organizationId: string;
  projectId: string;
  connection: common.ProjectConnection;
}) {
  let { sql, organizationId, projectId, connection } = item;

  let sqlString = sql.join('\n');

  let text =
    sqlString +
    organizationId +
    projectId +
    connection.connectionId +
    connection.type;

  const hash = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
