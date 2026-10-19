import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendCachedColumnDoesNotExistError = {
  code: 'BACKEND_CACHED_COLUMN_DOES_NOT_EXIST';
};

export let zBackendCachedColumnDoesNotExistError = z.object({
  code: z.literal('BACKEND_CACHED_COLUMN_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendCachedColumnDoesNotExistError,
  z.infer<typeof zBackendCachedColumnDoesNotExistError>
>({ value: true });
