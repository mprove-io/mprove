import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type BackendCommonError,
  zBackendCommonError
} from '#common/zod/backend/errors/backend-common-error';
import {
  type BackendInternalError,
  zBackendInternalError
} from '#common/zod/backend/errors/backend-internal-error';
import {
  type BackendInvalidRequestError,
  zBackendInvalidRequestError
} from '#common/zod/backend/errors/backend-invalid-request-error';
import type { ToBackendFailure } from '#common/zod/backend/response/to-backend-failure';
import {
  type ToBackendResponseMetadata,
  zToBackendResponseMetadata
} from '#common/zod/backend/response/to-backend-response-metadata';
import type { ToBackendSuccess } from '#common/zod/backend/response/to-backend-success';

export type ToBackendResponseBase<TOperation extends string, TOutput, TError> =
  | Extend<ToBackendResponseMetadata<TOperation>, ToBackendSuccess<TOutput>>
  | Extend<
      ToBackendResponseMetadata<TOperation>,
      ToBackendFailure<
        | TError
        | BackendCommonError
        | BackendInternalError
        | BackendInvalidRequestError
      >
    >;

export function makeToBackendResponseSchema<
  TOperation extends string,
  TOutput,
  TError
>(item: {
  operation: TOperation;
  output: z.ZodType<TOutput>;
  error: z.ZodType<TError>;
}): z.ZodType<ToBackendResponseBase<TOperation, TOutput, TError>> {
  let { operation, output, error } = item;

  let metadata = {
    ...zToBackendResponseMetadata.shape,
    operation: z.literal(operation)
  };

  let schema: z.ZodType<ToBackendResponseBase<TOperation, TOutput, TError>> =
    z.discriminatedUnion('type', [
      z
        .object({ type: z.literal('Success'), ...metadata, output: output })
        .transform(item => ({
          type: item.type,
          operation: item.operation,
          method: item.method,
          duration: item.duration,
          traceId: item.traceId,
          mproveVersion: item.mproveVersion,
          output: item.output
        })),
      z
        .object({
          type: z.literal('Failure'),
          ...metadata,
          error: z.union([
            error,
            zBackendCommonError,
            zBackendInternalError,
            zBackendInvalidRequestError
          ])
        })
        .transform(item => ({
          type: item.type,
          operation: item.operation,
          method: item.method,
          duration: item.duration,
          traceId: item.traceId,
          mproveVersion: item.mproveVersion,
          error: item.error
        }))
    ]);

  assertTypesEqual<
    ToBackendResponseBase<TOperation, TOutput, TError>,
    z.infer<typeof schema>
  >({ value: true });

  return schema;
}
