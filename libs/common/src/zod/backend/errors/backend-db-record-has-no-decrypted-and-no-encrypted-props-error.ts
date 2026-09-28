import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendDbRecordHasNoDecryptedAndNoEncryptedPropsError = {
  code: 'BACKEND_DB_RECORD_HAS_NO_DECRYPTED_AND_NO_ENCRYPTED_PROPS';
};

export let zBackendDbRecordHasNoDecryptedAndNoEncryptedPropsError = z.object({
  code: z.literal('BACKEND_DB_RECORD_HAS_NO_DECRYPTED_AND_NO_ENCRYPTED_PROPS')
});

assertTypesEqual<
  BackendDbRecordHasNoDecryptedAndNoEncryptedPropsError,
  z.infer<typeof zBackendDbRecordHasNoDecryptedAndNoEncryptedPropsError>
>({ value: true });
