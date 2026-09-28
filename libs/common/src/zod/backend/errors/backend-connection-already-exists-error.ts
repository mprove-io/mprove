import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendConnectionAlreadyExistsError = {
  code: 'BACKEND_CONNECTION_ALREADY_EXISTS';
};

export let zBackendConnectionAlreadyExistsError = z.object({
  code: z.literal('BACKEND_CONNECTION_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendConnectionAlreadyExistsError,
  z.infer<typeof zBackendConnectionAlreadyExistsError>
>({ value: true });
