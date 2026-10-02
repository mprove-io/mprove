import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProjectAlreadyExistsError = {
  code: 'BACKEND_PROJECT_ALREADY_EXISTS';
};

export let zBackendProjectAlreadyExistsError = z.object({
  code: z.literal('BACKEND_PROJECT_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendProjectAlreadyExistsError,
  z.infer<typeof zBackendProjectAlreadyExistsError>
>({ value: true });
