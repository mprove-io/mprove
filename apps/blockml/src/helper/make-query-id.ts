import * as crypto from 'crypto';
import { common } from '~blockml/barrels/common';

export function makeQueryId(item: {
  sql: string[];
  orgId: string;
  projectId: string;
  connection: common.ProjectConnection;
}) {
  let { sql, orgId, projectId, connection } = item;

  let sqlString = sql.join('\n');

  let text =
    sqlString + orgId + projectId + connection.connectionId + connection.type;

  const hash = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
