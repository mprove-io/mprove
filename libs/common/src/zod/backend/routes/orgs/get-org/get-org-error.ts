import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendForbiddenOrgError,
  zBackendForbiddenOrgError
} from '#common/zod/backend/errors/backend-forbidden-org-error';
import {
  type BackendOrgDoesNotExistError,
  zBackendOrgDoesNotExistError
} from '#common/zod/backend/errors/backend-org-does-not-exist-error';

export type ToBackendGetOrgError =
  | BackendForbiddenOrgError
  | BackendOrgDoesNotExistError;

export let zToBackendGetOrgError = z.discriminatedUnion('code', [
  zBackendForbiddenOrgError,
  zBackendOrgDoesNotExistError
]);

assertTypesEqual<ToBackendGetOrgError, z.infer<typeof zToBackendGetOrgError>>({
  value: true
});
