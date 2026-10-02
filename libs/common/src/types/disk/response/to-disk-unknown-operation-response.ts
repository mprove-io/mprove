import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskInvalidRequestError,
  zDiskInvalidRequestError
} from '#common/types/disk/errors/disk-invalid-request-error';
import type { ToDiskFailure } from '#common/types/disk/response/to-disk-failure';
import {
  type ToDiskResponseMetadata,
  zToDiskResponseMetadata
} from '#common/types/disk/response/to-disk-response-metadata';
import type { Extend } from '#common/types/extend';

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
