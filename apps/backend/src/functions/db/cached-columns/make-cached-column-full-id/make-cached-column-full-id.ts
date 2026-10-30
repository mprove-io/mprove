import * as crypto from 'node:crypto';

export function makeCachedColumnFullId(item: {
  projectId: string;
  connectionId: string;
  envId: string;
  schemaName: string;
  tableName: string;
  columnName: string;
}): string {
  let { projectId, connectionId, envId, schemaName, tableName, columnName } =
    item;

  let text =
    projectId +
    connectionId +
    envId +
    schemaName.toLowerCase() +
    tableName.toLowerCase() +
    columnName.toLowerCase();

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
