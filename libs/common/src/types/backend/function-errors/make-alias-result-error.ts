import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendUserAliasIsUndefinedError,
  zBackendUserAliasIsUndefinedError
} from '#common/types/backend/errors/backend-user-alias-is-undefined-error';
import {
  type GetDconfigHashSecretResultError,
  zGetDconfigHashSecretResultError
} from '#common/types/backend/function-errors/get-dconfig-hash-secret-result-error';
import {
  type MakeHashResultError,
  zMakeHashResultError
} from '#common/types/backend/function-errors/make-hash-result-error';

export type MakeAliasResultError =
  | BackendUserAliasIsUndefinedError
  | GetDconfigHashSecretResultError
  | MakeHashResultError;

export let zMakeAliasResultError = z.union([
  zBackendUserAliasIsUndefinedError,
  zGetDconfigHashSecretResultError,
  zMakeHashResultError
]);

assertTypesEqual<MakeAliasResultError, z.infer<typeof zMakeAliasResultError>>({
  value: true
});
