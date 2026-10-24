import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBranchIdDoesNotMatchSessionError,
  zBackendBranchIdDoesNotMatchSessionError
} from '#common/types/backend/errors/backend-branch-id-does-not-match-session-error';

export type ValidateMcpSessionBranchIdError =
  BackendBranchIdDoesNotMatchSessionError;

export let zValidateMcpSessionBranchIdError =
  zBackendBranchIdDoesNotMatchSessionError;

assertTypesEqual<
  ValidateMcpSessionBranchIdError,
  z.infer<typeof zValidateMcpSessionBranchIdError>
>({ value: true });
