import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendOcPartDoesNotExistError = {
  code: 'BACKEND_OC_PART_DOES_NOT_EXIST';
};

export let zBackendOcPartDoesNotExistError = z.object({
  code: z.literal('BACKEND_OC_PART_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendOcPartDoesNotExistError,
  z.infer<typeof zBackendOcPartDoesNotExistError>
>({ value: true });
