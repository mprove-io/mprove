import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendOnlyOrgOwnerCanAccessError,
  zBackendOnlyOrgOwnerCanAccessError
} from '#common/types/backend/errors/backend-only-org-owner-can-access-error';

export type CheckUserIsOrgOwnerResultError = BackendOnlyOrgOwnerCanAccessError;

export let zCheckUserIsOrgOwnerResultError = zBackendOnlyOrgOwnerCanAccessError;

assertTypesEqual<
  CheckUserIsOrgOwnerResultError,
  z.infer<typeof zCheckUserIsOrgOwnerResultError>
>({ value: true });
