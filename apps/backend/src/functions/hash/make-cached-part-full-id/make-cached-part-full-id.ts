import * as crypto from 'node:crypto';

export function makeCachedPartFullId(item: {
  projectId: string;
  connectionId: string;
  envId: string;
  schemaName: string;
  tableName: string;
  columnName: string;
  columnValue: string | null | undefined;
}): string {
  let {
    projectId,
    connectionId,
    envId,
    schemaName,
    tableName,
    columnName,
    columnValue
  } = item;

  let text: string = JSON.stringify([
    projectId,
    connectionId,
    envId,
    schemaName.toLowerCase(),
    tableName.toLowerCase(),
    columnName.toLowerCase(),
    columnValue
  ]);

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
