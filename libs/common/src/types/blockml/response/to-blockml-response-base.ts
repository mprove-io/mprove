import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BlockmlInternalError,
  zBlockmlInternalError
} from '#common/types/blockml/errors/blockml-internal-error';
import {
  type BlockmlInvalidRequestError,
  zBlockmlInvalidRequestError
} from '#common/types/blockml/errors/blockml-invalid-request-error';
import type { ToBlockmlFailure } from '#common/types/blockml/response/to-blockml-failure';
import {
  type ToBlockmlResponseMetadata,
  zToBlockmlResponseMetadata
} from '#common/types/blockml/response/to-blockml-response-metadata';
import type { ToBlockmlSuccess } from '#common/types/blockml/response/to-blockml-success';
import type { Extend } from '#common/types/extend';

export type ToBlockmlResponseBase<TOperation extends string, TOutput, TError> =
  | Extend<ToBlockmlResponseMetadata<TOperation>, ToBlockmlSuccess<TOutput>>
  | Extend<
      ToBlockmlResponseMetadata<TOperation>,
      ToBlockmlFailure<
        TError | BlockmlInternalError | BlockmlInvalidRequestError
      >
    >;

export function makeToBlockmlResponseSchema<
  TOperation extends string,
  TOutput,
  TError
>(item: {
  operation: TOperation;
  output: z.ZodType<TOutput>;
  error: z.ZodType<TError>;
}) {
  let { operation, output, error } = item;

  let metadata = {
    ...zToBlockmlResponseMetadata.shape,
    operation: z.literal(operation)
  };

  let schema = z.discriminatedUnion('type', [
    z
      .object({ type: z.literal('Success'), ...metadata, output: output })
      .transform(item => ({
        type: item.type,
        operation: item.operation,
        method: item.method,
        duration: item.duration,
        traceId: item.traceId,
        output: item.output
      })),
    z
      .object({
        type: z.literal('Failure'),
        ...metadata,
        error: z.union([
          error,
          zBlockmlInternalError,
          zBlockmlInvalidRequestError
        ])
      })
      .transform(item => ({
        type: item.type,
        operation: item.operation,
        method: item.method,
        duration: item.duration,
        traceId: item.traceId,
        error: item.error
      }))
  ]);

  assertTypesEqual<
    ToBlockmlResponseBase<TOperation, TOutput, TError>,
    z.infer<typeof schema>
  >({ value: true });

  return schema;
}
