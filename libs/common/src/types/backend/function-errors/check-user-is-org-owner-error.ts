import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendOnlyOrgOwnerCanAccessError,
  zBackendOnlyOrgOwnerCanAccessError
} from '#common/types/backend/errors/backend-only-org-owner-can-access-error';

export type CheckUserIsOrgOwnerError = BackendOnlyOrgOwnerCanAccessError;

export let zCheckUserIsOrgOwnerError = zBackendOnlyOrgOwnerCanAccessError;

assertTypesEqual<
  CheckUserIsOrgOwnerError,
  z.infer<typeof zCheckUserIsOrgOwnerError>
>({ value: true });
