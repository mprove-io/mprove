import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BlockmlInternalError,
  zBlockmlInternalError
} from '#common/zod/blockml/errors/blockml-internal-error';
import {
  type BlockmlInvalidRequestError,
  zBlockmlInvalidRequestError
} from '#common/zod/blockml/errors/blockml-invalid-request-error';

export type ToBlockmlResponse<TOperation extends string, TSuccess, TError> = {
  operation: TOperation;
  method: string;
  duration: number;
  traceId: string;
  result:
    | { type: 'Success'; value: TSuccess }
    | {
        type: 'Failure';
        error: TError | BlockmlInternalError | BlockmlInvalidRequestError;
      };
};

export function makeToBlockmlResponseSchema<
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
        z
          .object({ type: z.literal('Success'), value: success })
          .transform(item => ({ type: item.type, value: item.value })),
        z
          .object({
            type: z.literal('Failure'),
            error: z.union([
              error,
              zBlockmlInternalError,
              zBlockmlInvalidRequestError
            ])
          })
          .transform(item => ({ type: item.type, error: item.error }))
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
    ToBlockmlResponse<TOperation, TSuccess, TError>,
    z.infer<typeof schema>
  >({ value: true });

  return schema;
}
