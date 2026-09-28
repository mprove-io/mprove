import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendDbRecordHasBothDecryptedAndEncryptedPropsError = {
  code: 'BACKEND_DB_RECORD_HAS_BOTH_DECRYPTED_AND_ENCRYPTED_PROPS';
};

export let zBackendDbRecordHasBothDecryptedAndEncryptedPropsError = z.object({
  code: z.literal('BACKEND_DB_RECORD_HAS_BOTH_DECRYPTED_AND_ENCRYPTED_PROPS')
});

assertTypesEqual<
  BackendDbRecordHasBothDecryptedAndEncryptedPropsError,
  z.infer<typeof zBackendDbRecordHasBothDecryptedAndEncryptedPropsError>
>({ value: true });
