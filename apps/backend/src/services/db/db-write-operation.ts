export const dbWriteOperationValues = [
  'insert',
  'update',
  'insertOrUpdate',
  'insertOrDoNothing'
] as const;

export type DbWriteOperation = (typeof dbWriteOperationValues)[number];
