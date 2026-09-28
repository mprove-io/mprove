import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendOnlyOrgOwnerCanAccessError,
  zBackendOnlyOrgOwnerCanAccessError
} from '#common/zod/backend/errors/backend-only-org-owner-can-access-error';
import {
  type BackendOrgDoesNotExistError,
  zBackendOrgDoesNotExistError
} from '#common/zod/backend/errors/backend-org-does-not-exist-error';

export type ToBackendGetOrgUsersError =
  | BackendOnlyOrgOwnerCanAccessError
  | BackendOrgDoesNotExistError;

export let zToBackendGetOrgUsersError = z.discriminatedUnion('code', [
  zBackendOnlyOrgOwnerCanAccessError,
  zBackendOrgDoesNotExistError
]);

assertTypesEqual<
  ToBackendGetOrgUsersError,
  z.infer<typeof zToBackendGetOrgUsersError>
>({ value: true });
