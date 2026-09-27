import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type DiskInvalidRequestError,
  zDiskInvalidRequestError
} from '#common/zod/disk/errors/disk-invalid-request-error';
import type { ToDiskFailure } from '#common/zod/disk/response/to-disk-failure';
import {
  type ToDiskResponseMetadata,
  zToDiskResponseMetadata
} from '#common/zod/disk/response/to-disk-response-metadata';

export type ToDiskUnknownOperationResponse = Extend<
  ToDiskResponseMetadata<string>,
  ToDiskFailure<DiskInvalidRequestError>
>;

export let zToDiskUnknownOperationResponse = z.object({
  type: z.literal('Failure'),
  ...zToDiskResponseMetadata.shape,
  error: zDiskInvalidRequestError
});

assertTypesEqual<
  ToDiskUnknownOperationResponse,
  z.infer<typeof zToDiskUnknownOperationResponse>
>({ value: true });
