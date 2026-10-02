import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendDbRecordIsDecryptedButHasKeyTagError = {
  code: 'BACKEND_DB_RECORD_IS_DECRYPTED_BUT_HAS_KEY_TAG';
};

export let zBackendDbRecordIsDecryptedButHasKeyTagError = z.object({
  code: z.literal('BACKEND_DB_RECORD_IS_DECRYPTED_BUT_HAS_KEY_TAG')
});

assertTypesEqual<
  BackendDbRecordIsDecryptedButHasKeyTagError,
  z.infer<typeof zBackendDbRecordIsDecryptedButHasKeyTagError>
>({ value: true });
