import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendKitDoesNotExistError = {
  code: 'BACKEND_KIT_DOES_NOT_EXIST';
};

export let zBackendKitDoesNotExistError = z.object({
  code: z.literal('BACKEND_KIT_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendKitDoesNotExistError,
  z.infer<typeof zBackendKitDoesNotExistError>
>({ value: true });
