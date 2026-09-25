import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type DiskInvalidRequestError,
  zDiskInvalidRequestError
} from '#common/zod/disk/errors/disk-invalid-request-error';
import type { ToDiskResponse } from '#common/zod/disk/response/to-disk-response';

export type ToDiskInvalidRequestErrorResponse = Extend<
  ToDiskResponse<string, never, DiskInvalidRequestError>,
  { result: { type: 'Failure'; error: DiskInvalidRequestError } }
>;

export let zToDiskInvalidRequestErrorResponse = z.object({
  operation: z.string(),
  method: z.string(),
  duration: z.number().nonnegative(),
  traceId: z.string(),
  result: z.object({
    type: z.literal('Failure'),
    error: zDiskInvalidRequestError
  })
});

assertTypesEqual<
  ToDiskInvalidRequestErrorResponse,
  z.infer<typeof zToDiskInvalidRequestErrorResponse>
>({ value: true });
