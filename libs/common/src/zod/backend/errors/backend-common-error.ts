import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendApiKeyNotFoundError,
  zBackendApiKeyNotFoundError
} from '#common/zod/backend/errors/backend-api-key-not-found-error';
import {
  type BackendApiKeyNotValidError,
  zBackendApiKeyNotValidError
} from '#common/zod/backend/errors/backend-api-key-not-valid-error';
import {
  type BackendBranchIdDoesNotMatchSessionError,
  zBackendBranchIdDoesNotMatchSessionError
} from '#common/zod/backend/errors/backend-branch-id-does-not-match-session-error';
import {
  type BackendDbRecordHasBothDecryptedAndEncryptedPropsError,
  zBackendDbRecordHasBothDecryptedAndEncryptedPropsError
} from '#common/zod/backend/errors/backend-db-record-has-both-decrypted-and-encrypted-props-error';
import {
  type BackendDbRecordHasNoDecryptedAndNoEncryptedPropsError,
  zBackendDbRecordHasNoDecryptedAndNoEncryptedPropsError
} from '#common/zod/backend/errors/backend-db-record-has-no-decrypted-and-no-encrypted-props-error';
import {
  type BackendDbRecordIsDecryptedButHasKeyTagError,
  zBackendDbRecordIsDecryptedButHasKeyTagError
} from '#common/zod/backend/errors/backend-db-record-is-decrypted-but-has-key-tag-error';
import {
  type BackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError,
  zBackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError
} from '#common/zod/backend/errors/backend-db-record-key-tag-does-not-match-current-or-prev-error';
import {
  type BackendEnvIdDoesNotMatchSessionError,
  zBackendEnvIdDoesNotMatchSessionError
} from '#common/zod/backend/errors/backend-env-id-does-not-match-session-error';
import {
  type BackendGetIdempRespRetryError,
  zBackendGetIdempRespRetryError
} from '#common/zod/backend/errors/backend-get-idemp-resp-retry-error';
import {
  type BackendGetIdempRespRetryFailedError,
  zBackendGetIdempRespRetryFailedError
} from '#common/zod/backend/errors/backend-get-idemp-resp-retry-failed-error';
import {
  type BackendIdempUserMismatchError,
  zBackendIdempUserMismatchError
} from '#common/zod/backend/errors/backend-idemp-user-mismatch-error';
import {
  type BackendNotAuthorizedError,
  zBackendNotAuthorizedError
} from '#common/zod/backend/errors/backend-not-authorized-error';
import {
  type BackendRepoIdDoesNotMatchSessionError,
  zBackendRepoIdDoesNotMatchSessionError
} from '#common/zod/backend/errors/backend-repo-id-does-not-match-session-error';
import {
  type BackendRepoIdDoesNotMatchUserError,
  zBackendRepoIdDoesNotMatchUserError
} from '#common/zod/backend/errors/backend-repo-id-does-not-match-user-error';
import {
  type BackendSessionApiKeyRequestNotAllowedError,
  zBackendSessionApiKeyRequestNotAllowedError
} from '#common/zod/backend/errors/backend-session-api-key-request-not-allowed-error';
import {
  type BackendTestRoutesForbiddenError,
  zBackendTestRoutesForbiddenError
} from '#common/zod/backend/errors/backend-test-routes-forbidden-error';
import {
  type BackendThrottlerUserIdIsNotDefinedError,
  zBackendThrottlerUserIdIsNotDefinedError
} from '#common/zod/backend/errors/backend-throttler-user-id-is-not-defined-error';
import {
  type BackendUnauthorizedError,
  zBackendUnauthorizedError
} from '#common/zod/backend/errors/backend-unauthorized-error';
import {
  type BackendUserApiKeyRequestNotAllowedError,
  zBackendUserApiKeyRequestNotAllowedError
} from '#common/zod/backend/errors/backend-user-api-key-request-not-allowed-error';
import {
  type BackendUserDoesNotExistError,
  zBackendUserDoesNotExistError
} from '#common/zod/backend/errors/backend-user-does-not-exist-error';
import {
  type BackendWrongApiKeyFormatError,
  zBackendWrongApiKeyFormatError
} from '#common/zod/backend/errors/backend-wrong-api-key-format-error';
import {
  type EnvVarValueMustBeTrueOrFalseError,
  zEnvVarValueMustBeTrueOrFalseError
} from '#common/zod/backend/errors/env-var-value-must-be-true-or-false-error';
import {
  type ThrottlerError,
  zThrottlerError
} from '#common/zod/backend/errors/throttler-error';
import {
  type TooManyRequestsError,
  zTooManyRequestsError
} from '#common/zod/backend/errors/too-many-requests-error';

export type BackendCommonError =
  | BackendApiKeyNotFoundError
  | BackendApiKeyNotValidError
  | BackendBranchIdDoesNotMatchSessionError
  | BackendDbRecordHasBothDecryptedAndEncryptedPropsError
  | BackendDbRecordHasNoDecryptedAndNoEncryptedPropsError
  | BackendDbRecordIsDecryptedButHasKeyTagError
  | BackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError
  | BackendEnvIdDoesNotMatchSessionError
  | BackendGetIdempRespRetryError
  | BackendGetIdempRespRetryFailedError
  | BackendIdempUserMismatchError
  | BackendNotAuthorizedError
  | BackendRepoIdDoesNotMatchSessionError
  | BackendRepoIdDoesNotMatchUserError
  | BackendSessionApiKeyRequestNotAllowedError
  | BackendTestRoutesForbiddenError
  | BackendThrottlerUserIdIsNotDefinedError
  | BackendUnauthorizedError
  | BackendUserApiKeyRequestNotAllowedError
  | BackendUserDoesNotExistError
  | BackendWrongApiKeyFormatError
  | EnvVarValueMustBeTrueOrFalseError
  | ThrottlerError
  | TooManyRequestsError;

export let zBackendCommonError = z.discriminatedUnion('code', [
  zBackendApiKeyNotFoundError,
  zBackendApiKeyNotValidError,
  zBackendBranchIdDoesNotMatchSessionError,
  zBackendDbRecordHasBothDecryptedAndEncryptedPropsError,
  zBackendDbRecordHasNoDecryptedAndNoEncryptedPropsError,
  zBackendDbRecordIsDecryptedButHasKeyTagError,
  zBackendDbRecordKeyTagDoesNotMatchCurrentOrPrevError,
  zBackendEnvIdDoesNotMatchSessionError,
  zBackendGetIdempRespRetryError,
  zBackendGetIdempRespRetryFailedError,
  zBackendIdempUserMismatchError,
  zBackendNotAuthorizedError,
  zBackendRepoIdDoesNotMatchSessionError,
  zBackendRepoIdDoesNotMatchUserError,
  zBackendSessionApiKeyRequestNotAllowedError,
  zBackendTestRoutesForbiddenError,
  zBackendThrottlerUserIdIsNotDefinedError,
  zBackendUnauthorizedError,
  zBackendUserApiKeyRequestNotAllowedError,
  zBackendUserDoesNotExistError,
  zBackendWrongApiKeyFormatError,
  zEnvVarValueMustBeTrueOrFalseError,
  zThrottlerError,
  zTooManyRequestsError
]);

assertTypesEqual<BackendCommonError, z.infer<typeof zBackendCommonError>>({
  value: true
});
