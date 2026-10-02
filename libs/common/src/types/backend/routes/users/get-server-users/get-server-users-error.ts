import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendUserIsNotServerAdminError,
  zBackendUserIsNotServerAdminError
} from '#common/types/backend/errors/backend-user-is-not-server-admin-error';

export type ToBackendGetServerUsersError = BackendUserIsNotServerAdminError;

export let zToBackendGetServerUsersError = zBackendUserIsNotServerAdminError;

assertTypesEqual<
  ToBackendGetServerUsersError,
  z.infer<typeof zToBackendGetServerUsersError>
>({ value: true });
