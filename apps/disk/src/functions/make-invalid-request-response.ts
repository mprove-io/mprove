import { z } from 'zod';
import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import type { ToDiskResponseForOperation } from '#common/zod/to-disk/to-disk-response-for-operation';

export function makeInvalidRequestResponse<
  TOperation extends ToDiskOperation
>(item: {
  operation: TOperation;
  message: unknown;
  error: z.ZodError;
  startTs: number;
  method: string;
}): ToDiskResponseForOperation<TOperation> {
  let { operation, message, error, startTs, method } = item;

  let metadata: z.ZodSafeParseResult<{ traceId: string }> = z
    .object({ traceId: z.string() })
    .safeParse(message);

  let response: ToDiskResponseForOperation<TOperation> = {
    operation: operation,
    method: method,
    duration: Date.now() - startTs,
    traceId: metadata.success ? metadata.data.traceId : '',
    result: {
      type: 'InvalidRequest',
      issues: error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    }
  };

  return response;
}
