import { z } from 'zod';
import {
  type ToDiskOperationName,
  type ToDiskWireResponseFor
} from '#common/zod/to-disk/to-disk-operation-contract';

export function makeInvalidRequestResponse<
  TName extends ToDiskOperationName
>(item: {
  name: TName;
  message: unknown;
  error: z.ZodError;
  startTs: number;
  method: string;
}): ToDiskWireResponseFor<TName> {
  let { name, message, error, startTs, method } = item;

  let metadata: z.ZodSafeParseResult<{ traceId: string }> = z
    .object({ traceId: z.string() })
    .safeParse(message);

  let response: ToDiskWireResponseFor<TName> = {
    path: name,
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
