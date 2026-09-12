import type { z } from 'zod';
import {
  type ToDiskOperation,
  zToDiskOperation
} from '#common/zod/to-disk/to-disk-operation';

export function parseToDiskOperation(item: {
  operation: unknown;
}): z.ZodSafeParseResult<ToDiskOperation> {
  let result: z.ZodSafeParseResult<ToDiskOperation> =
    zToDiskOperation.safeParse(item.operation);

  return result;
}
