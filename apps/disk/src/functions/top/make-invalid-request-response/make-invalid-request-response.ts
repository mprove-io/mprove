import { z } from 'zod';
import type { ToDiskOperation } from '#common/zod/disk/request/to-disk-operation';
import { zToDiskOperationRegistry } from '#common/zod/disk/request/to-disk-operation-registry';
import type { ToDiskResponseForOperation } from '#common/zod/disk/response/to-disk-response-for-operation';

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

  let response: ToDiskResponseForOperation<TOperation> =
    zToDiskOperationRegistry[operation].response.parse({
      type: 'Failure',
      operation: operation,
      method: method,
      duration: Date.now() - startTs,
      traceId: metadata.success ? metadata.data.traceId : '',
      error: {
        code: 'DISK_INVALID_REQUEST',
        displayData: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code
        }))
      }
    });

  return response;
}
