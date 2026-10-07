import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendDbRecordHasBothDecryptedAndEncryptedPropsError,
  zBackendDbRecordHasBothDecryptedAndEncryptedPropsError
} from '#common/types/backend/errors/backend-db-record-has-both-decrypted-and-encrypted-props-error';
import {
  type BackendDbRecordHasNoDecryptedAndNoEncryptedPropsError,
  zBackendDbRecordHasNoDecryptedAndNoEncryptedPropsError
} from '#common/types/backend/errors/backend-db-record-has-no-decrypted-and-no-encrypted-props-error';
import {
  type BackendDbRecordIsDecryptedButHasKeyTagError,
  zBackendDbRecordIsDecryptedButHasKeyTagError
} from '#common/types/backend/errors/backend-db-record-is-decrypted-but-has-key-tag-error';
import {
  type BackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError,
  zBackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError
} from '#common/types/backend/errors/backend-db-record-key-tag-does-not-match-current-or-prev-error';

export type GetTabPropsResultError =
  | BackendDbRecordHasBothDecryptedAndEncryptedPropsError
  | BackendDbRecordHasNoDecryptedAndNoEncryptedPropsError
  | BackendDbRecordIsDecryptedButHasKeyTagError
  | BackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError;

export let zGetTabPropsResultError = z.discriminatedUnion('code', [
  zBackendDbRecordHasBothDecryptedAndEncryptedPropsError,
  zBackendDbRecordHasNoDecryptedAndNoEncryptedPropsError,
  zBackendDbRecordIsDecryptedButHasKeyTagError,
  zBackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError
]);

assertTypesEqual<
  GetTabPropsResultError,
  z.infer<typeof zGetTabPropsResultError>
>({
  value: true
});
