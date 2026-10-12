import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendUserAliasIsUndefinedError,
  zBackendUserAliasIsUndefinedError
} from '#common/types/backend/errors/backend-user-alias-is-undefined-error';
import {
  type GetDconfigHashSecretError,
  zGetDconfigHashSecretError
} from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import {
  type MakeHashError,
  zMakeHashError
} from '#common/types/backend/function-errors/make-hash-error';

export type MakeAliasError =
  | BackendUserAliasIsUndefinedError
  | GetDconfigHashSecretError
  | MakeHashError;

export let zMakeAliasError = z.union([
  zBackendUserAliasIsUndefinedError,
  zGetDconfigHashSecretError,
  zMakeHashError
]);

assertTypesEqual<MakeAliasError, z.infer<typeof zMakeAliasError>>({
  value: true
});
