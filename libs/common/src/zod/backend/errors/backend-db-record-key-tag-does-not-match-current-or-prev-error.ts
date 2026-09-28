import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError = {
  code: 'BACKEND_DB_RECORD_KEY_TAG_DOES_NOT_MATCH_CURRENT_OR_PREV';
};

export let zBackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError = z.object({
  code: z.literal('BACKEND_DB_RECORD_KEY_TAG_DOES_NOT_MATCH_CURRENT_OR_PREV')
});

assertTypesEqual<
  BackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError,
  z.infer<typeof zBackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError>
>({ value: true });
