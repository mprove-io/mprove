import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskInternalError,
  zDiskInternalError
} from '#common/types/disk/errors/disk-internal-error';
import {
  type DiskInvalidRequestError,
  zDiskInvalidRequestError
} from '#common/types/disk/errors/disk-invalid-request-error';
import type { ToDiskFailure } from '#common/types/disk/response/to-disk-failure';
import {
  type ToDiskResponseMetadata,
  zToDiskResponseMetadata
} from '#common/types/disk/response/to-disk-response-metadata';
import type { ToDiskSuccess } from '#common/types/disk/response/to-disk-success';
import type { Extend } from '#common/types/extend';

export type ToDiskResponseBase<TOperation extends string, TOutput, TError> =
  | Extend<ToDiskResponseMetadata<TOperation>, ToDiskSuccess<TOutput>>
  | Extend<
      ToDiskResponseMetadata<TOperation>,
      ToDiskFailure<TError | DiskInternalError | DiskInvalidRequestError>
    >;

export function makeToDiskResponseSchema<
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
    ...zToDiskResponseMetadata.shape,
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
        error: z.union([error, zDiskInternalError, zDiskInvalidRequestError])
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
    ToDiskResponseBase<TOperation, TOutput, TError>,
    z.infer<typeof schema>
  >({ value: true });

  return schema;
}
