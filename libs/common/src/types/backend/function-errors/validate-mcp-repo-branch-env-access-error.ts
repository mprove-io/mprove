import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ValidateMcpEnvAccessError,
  zValidateMcpEnvAccessError
} from '#common/types/backend/function-errors/validate-mcp-env-access-error';
import {
  type ValidateMcpSessionBranchIdError,
  zValidateMcpSessionBranchIdError
} from '#common/types/backend/function-errors/validate-mcp-session-branch-id-error';
import {
  type ValidateMcpSessionRepoIdError,
  zValidateMcpSessionRepoIdError
} from '#common/types/backend/function-errors/validate-mcp-session-repo-id-error';
import {
  type ValidateMcpUserRepoIdError,
  zValidateMcpUserRepoIdError
} from '#common/types/backend/function-errors/validate-mcp-user-repo-id-error';

export type ValidateMcpRepoBranchEnvAccessError =
  | ValidateMcpUserRepoIdError
  | ValidateMcpSessionRepoIdError
  | ValidateMcpSessionBranchIdError
  | ValidateMcpEnvAccessError;

export let zValidateMcpRepoBranchEnvAccessError = z.union([
  zValidateMcpUserRepoIdError,
  zValidateMcpSessionRepoIdError,
  zValidateMcpSessionBranchIdError,
  zValidateMcpEnvAccessError
]);

assertTypesEqual<
  ValidateMcpRepoBranchEnvAccessError,
  z.infer<typeof zValidateMcpRepoBranchEnvAccessError>
>({ value: true });
