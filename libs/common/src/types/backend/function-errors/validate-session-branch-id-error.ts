import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBranchIdDoesNotMatchSessionError,
  zBackendBranchIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-branch-id-does-not-match-session-error';

export type ValidateSessionBranchIdError =
  BackendBranchIdDoesNotMatchSessionError;

export let zValidateSessionBranchIdError =
  zBackendBranchIdDoesNotMatchSessionError;

assertTypesEqual<
  ValidateSessionBranchIdError,
  z.infer<typeof zValidateSessionBranchIdError>
>({ value: true });
