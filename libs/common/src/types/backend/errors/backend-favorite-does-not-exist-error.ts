import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFavoriteDoesNotExistError = {
  code: 'BACKEND_FAVORITE_DOES_NOT_EXIST';
};

export let zBackendFavoriteDoesNotExistError = z.object({
  code: z.literal('BACKEND_FAVORITE_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendFavoriteDoesNotExistError,
  z.infer<typeof zBackendFavoriteDoesNotExistError>
>({ value: true });
