import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendModelFieldLeafDoesNotExistError = {
  code: 'BACKEND_MODEL_FIELD_LEAF_DOES_NOT_EXIST';
};

export let zBackendModelFieldLeafDoesNotExistError = z.object({
  code: z.literal('BACKEND_MODEL_FIELD_LEAF_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendModelFieldLeafDoesNotExistError,
  z.infer<typeof zBackendModelFieldLeafDoesNotExistError>
>({ value: true });
