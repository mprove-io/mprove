import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendOcEventDoesNotExistError = {
  code: 'BACKEND_OC_EVENT_DOES_NOT_EXIST';
};

export let zBackendOcEventDoesNotExistError = z.object({
  code: z.literal('BACKEND_OC_EVENT_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendOcEventDoesNotExistError,
  z.infer<typeof zBackendOcEventDoesNotExistError>
>({ value: true });
