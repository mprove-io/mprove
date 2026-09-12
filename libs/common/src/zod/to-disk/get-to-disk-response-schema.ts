import type { z } from 'zod';
import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import { toDiskOperationRegistry } from '#common/zod/to-disk/to-disk-operation-registry';
import type { ToDiskResponseForOperation } from '#common/zod/to-disk/to-disk-response-for-operation';

export function getToDiskResponseSchema<
  TOperation extends ToDiskOperation
>(item: {
  operation: TOperation;
}): z.ZodType<ToDiskResponseForOperation<TOperation>> {
  let schema: z.ZodType<ToDiskResponseForOperation<TOperation>> =
    toDiskOperationRegistry[item.operation].response;

  return schema;
}
