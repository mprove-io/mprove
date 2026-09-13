import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskInvalidRequestError,
  zDiskInvalidRequestError
} from '#common/zod/disk/errors/disk-invalid-request-error';

// No operation metadata can be claimed when the request cannot be routed.
export type ToDiskUnrouteableResponse = {
  result: { type: 'Failure'; error: DiskInvalidRequestError };
};

export let zToDiskUnrouteableResponse = z.object({
  result: z.object({
    type: z.literal('Failure'),
    error: zDiskInvalidRequestError
  })
});

assertTypesEqual<
  ToDiskUnrouteableResponse,
  z.infer<typeof zToDiskUnrouteableResponse>
>({ value: true });
