import type { CommitCommandError } from '#mcli/types/function-errors/commit-command-error';
import type { CreateBranchCommandError } from '#mcli/types/function-errors/create-branch-command-error';
import type { DeleteBranchCommandError } from '#mcli/types/function-errors/delete-branch-command-error';
import type { GetBranchesCommandError } from '#mcli/types/function-errors/get-branches-command-error';
import type { GetConnectionsListCommandError } from '#mcli/types/function-errors/get-connections-list-command-error';
import type { GetModelCommandError } from '#mcli/types/function-errors/get-model-command-error';
import type { GetQueryInfoCommandError } from '#mcli/types/function-errors/get-query-info-command-error';
import type { GetSampleCommandError } from '#mcli/types/function-errors/get-sample-command-error';
import type { GetSchemasCommandError } from '#mcli/types/function-errors/get-schemas-command-error';
import type { GetSkillsCommandError } from '#mcli/types/function-errors/get-skills-command-error';
import type { GetStateCommandError } from '#mcli/types/function-errors/get-state-command-error';
import type { MergeCommandError } from '#mcli/types/function-errors/merge-command-error';
import type { PullCommandError } from '#mcli/types/function-errors/pull-command-error';
import type { PushCommandError } from '#mcli/types/function-errors/push-command-error';
import type { RevertCommandError } from '#mcli/types/function-errors/revert-command-error';
import type { RunCommandError } from '#mcli/types/function-errors/run-command-error';
import type { SyncCommandError } from '#mcli/types/function-errors/sync-command-error';
import type { ValidateCommandError } from '#mcli/types/function-errors/validate-command-error';

export type ActError =
  | CommitCommandError
  | CreateBranchCommandError
  | DeleteBranchCommandError
  | GetBranchesCommandError
  | GetConnectionsListCommandError
  | GetModelCommandError
  | GetQueryInfoCommandError
  | GetSampleCommandError
  | GetSchemasCommandError
  | GetSkillsCommandError
  | GetStateCommandError
  | MergeCommandError
  | PullCommandError
  | PushCommandError
  | RevertCommandError
  | RunCommandError
  | SyncCommandError
  | ValidateCommandError;
