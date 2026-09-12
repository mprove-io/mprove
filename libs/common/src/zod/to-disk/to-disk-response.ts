import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type ToDiskInternalFailure,
  zToDiskInternalFailure
} from './to-disk-internal-failure';
import {
  type ToDiskInvalidRequest,
  zToDiskInvalidRequest
} from './to-disk-invalid-request';

export type ToDiskResponse<TOperation extends string, TSuccess, TError> = {
  operation: TOperation;
  method: string;
  duration: number;
  traceId: string;
  result:
    | { type: 'Success'; value: TSuccess }
    | { type: 'Failure'; error: TError }
    | ToDiskInternalFailure
    | ToDiskInvalidRequest;
};

export function makeToDiskResponseSchema<
  TOperation extends string,
  TSuccess,
  TError
>(item: {
  operation: TOperation;
  success: z.ZodType<TSuccess>;
  error: z.ZodType<TError>;
}) {
  let { operation, success, error } = item;

  let schema = z
    .object({
      operation: z.literal(operation),
      method: z.string(),
      duration: z.number().nonnegative(),
      traceId: z.string(),
      result: z.discriminatedUnion('type', [
        // Project generic fields explicitly with strictNullChecks disabled.
        z
          .object({ type: z.literal('Success'), value: success })
          .transform(item => ({ type: item.type, value: item.value })),
        z
          .object({ type: z.literal('Failure'), error: error })
          .transform(item => ({ type: item.type, error: item.error })),
        zToDiskInternalFailure,
        zToDiskInvalidRequest
      ])
    })
    .transform(item => ({
      operation: item.operation,
      method: item.method,
      duration: item.duration,
      traceId: item.traceId,
      result: item.result
    }));

  assertTypesEqual<
    ToDiskResponse<TOperation, TSuccess, TError>,
    z.infer<typeof schema>
  >({ value: true });

  return schema;
}
