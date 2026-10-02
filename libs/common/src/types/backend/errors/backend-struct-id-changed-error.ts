import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendStructIdChangedError = {
  code: 'BACKEND_STRUCT_ID_CHANGED';
};

export let zBackendStructIdChangedError = z.object({
  code: z.literal('BACKEND_STRUCT_ID_CHANGED')
});

assertTypesEqual<
  BackendStructIdChangedError,
  z.infer<typeof zBackendStructIdChangedError>
>({ value: true });
