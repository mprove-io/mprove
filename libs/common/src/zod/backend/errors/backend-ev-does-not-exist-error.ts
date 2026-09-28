import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendEvDoesNotExistError = {
  code: 'BACKEND_EV_DOES_NOT_EXIST';
};

export let zBackendEvDoesNotExistError = z.object({
  code: z.literal('BACKEND_EV_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendEvDoesNotExistError,
  z.infer<typeof zBackendEvDoesNotExistError>
>({ value: true });
