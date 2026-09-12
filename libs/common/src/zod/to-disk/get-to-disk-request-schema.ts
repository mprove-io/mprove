import type { z } from 'zod';
import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import { toDiskOperationRegistry } from '#common/zod/to-disk/to-disk-operation-registry';
import type { ToDiskRequestForOperation } from '#common/zod/to-disk/to-disk-request-for-operation';

export function getToDiskRequestSchema<
  TOperation extends ToDiskOperation
>(item: {
  operation: TOperation;
}): z.ZodType<ToDiskRequestForOperation<TOperation>> {
  let schema: z.ZodType<ToDiskRequestForOperation<TOperation>> =
    toDiskOperationRegistry[item.operation].request;

  return schema;
}
