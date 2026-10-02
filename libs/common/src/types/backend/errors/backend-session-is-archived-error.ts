import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSessionIsArchivedError = {
  code: 'BACKEND_SESSION_IS_ARCHIVED';
};

export let zBackendSessionIsArchivedError = z.object({
  code: z.literal('BACKEND_SESSION_IS_ARCHIVED')
});

assertTypesEqual<
  BackendSessionIsArchivedError,
  z.infer<typeof zBackendSessionIsArchivedError>
>({ value: true });
