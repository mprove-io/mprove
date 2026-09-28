import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendEvAlreadyExistsError = {
  code: 'BACKEND_EV_ALREADY_EXISTS';
};

export let zBackendEvAlreadyExistsError = z.object({
  code: z.literal('BACKEND_EV_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendEvAlreadyExistsError,
  z.infer<typeof zBackendEvAlreadyExistsError>
>({ value: true });
