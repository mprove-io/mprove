import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendNewOwnerNotFoundError = {
  code: 'BACKEND_NEW_OWNER_NOT_FOUND';
};

export let zBackendNewOwnerNotFoundError = z.object({
  code: z.literal('BACKEND_NEW_OWNER_NOT_FOUND')
});

assertTypesEqual<
  BackendNewOwnerNotFoundError,
  z.infer<typeof zBackendNewOwnerNotFoundError>
>({ value: true });
