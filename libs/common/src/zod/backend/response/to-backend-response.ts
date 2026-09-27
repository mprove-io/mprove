import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { BackendError } from '#common/zod/backend/errors/backend-error';

export type ToBackendResponse<TSuccess = unknown, TError = BackendError> = {
  method: string;
  duration: number;
  traceId: string;
  mproveVersion: string;
  result:
    | { type: 'Success'; value: TSuccess }
    | { type: 'Failure'; error: TError };
};

export function makeToBackendResponseSchema<TSuccess, TError>(item: {
  success: z.ZodType<TSuccess>;
  error: z.ZodType<TError>;
}) {
  let { success, error } = item;

  let schema = z
    .object({
      method: z.string(),
      duration: z.number().nonnegative(),
      traceId: z.string(),
      mproveVersion: z.string(),
      result: z.discriminatedUnion('type', [
        z
          .object({ type: z.literal('Success'), value: success })
          .transform(item => ({ type: item.type, value: item.value })),
        z
          .object({ type: z.literal('Failure'), error: error })
          .transform(item => ({ type: item.type, error: item.error }))
      ])
    })
    .transform(item => ({
      method: item.method,
      duration: item.duration,
      traceId: item.traceId,
      mproveVersion: item.mproveVersion,
      result: item.result
    }));

  assertTypesEqual<ToBackendResponse<TSuccess, TError>, z.infer<typeof schema>>(
    { value: true }
  );

  return schema;
}
