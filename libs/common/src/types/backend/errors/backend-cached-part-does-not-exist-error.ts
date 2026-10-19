import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendCachedPartDoesNotExistError = {
  code: 'BACKEND_CACHED_PART_DOES_NOT_EXIST';
};

export let zBackendCachedPartDoesNotExistError = z.object({
  code: z.literal('BACKEND_CACHED_PART_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendCachedPartDoesNotExistError,
  z.infer<typeof zBackendCachedPartDoesNotExistError>
>({ value: true });
