import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ValidateMcpRepoBranchEnvAccessError,
  zValidateMcpRepoBranchEnvAccessError
} from '#common/types/backend/function-errors/validate-mcp-repo-branch-env-access-error';
import {
  type ValidateMcpSessionProjectIdError,
  zValidateMcpSessionProjectIdError
} from '#common/types/backend/function-errors/validate-mcp-session-project-id-error';

export type ValidateMcpProjectRepoBranchEnvAccessError =
  | ValidateMcpSessionProjectIdError
  | ValidateMcpRepoBranchEnvAccessError;

export let zValidateMcpProjectRepoBranchEnvAccessError = z.union([
  zValidateMcpSessionProjectIdError,
  zValidateMcpRepoBranchEnvAccessError
]);

assertTypesEqual<
  ValidateMcpProjectRepoBranchEnvAccessError,
  z.infer<typeof zValidateMcpProjectRepoBranchEnvAccessError>
>({ value: true });
