import { z } from 'zod';
import type { ToBlockmlOperation } from '#common/zod/blockml/request/to-blockml-operation';
import type { ToBlockmlResponseForOperation } from '#common/zod/blockml/response/to-blockml-response-for-operation';

export function makeInvalidRequestResponse<
  TOperation extends ToBlockmlOperation
>(item: {
  operation: TOperation;
  message: unknown;
  error: z.ZodError;
  startTs: number;
  method: string;
}): ToBlockmlResponseForOperation<TOperation> {
  let { operation, message, error, startTs, method } = item;

  let metadata: z.ZodSafeParseResult<{ traceId: string }> = z
    .object({ traceId: z.string() })
    .safeParse(message);

  let response: ToBlockmlResponseForOperation<TOperation> = {
    operation: operation,
    method: method,
    duration: Date.now() - startTs,
    traceId: metadata.success ? metadata.data.traceId : '',
    result: {
      type: 'Failure',
      error: {
        code: 'BLOCKML_INVALID_REQUEST',
        displayData: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code
        }))
      }
    }
  };

  return response;
}
