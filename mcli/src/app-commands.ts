import { DefinitionsCommand } from './commands/base/definitions/definitions.command';
import { HelpCommand } from './commands/base/help/help.command';
import { VersionCommand } from './commands/base/version/version.command';
import { CommitCommand } from './commands/custom/commit/commit.command';
import { CreateBranchCommand } from './commands/custom/create-branch/create-branch.command';
import { DeleteBranchCommand } from './commands/custom/delete-branch/delete-branch.command';
import { GetBranchesCommand } from './commands/custom/get-branches/get-branches.command';
import { GetConnectionsListCommand } from './commands/custom/get-connections-list/get-connections-list.command';
import { GetModelCommand } from './commands/custom/get-model/get-model.command';
import { GetQueryInfoCommand } from './commands/custom/get-query-info/get-query-info.command';
import { GetSampleCommand } from './commands/custom/get-sample/get-sample.command';
import { GetSchemasCommand } from './commands/custom/get-schemas/get-schemas.command';
import { GetSkillsCommand } from './commands/custom/get-skills/get-skills.command';
import { GetStateCommand } from './commands/custom/get-state/get-state.command';
import { MergeCommand } from './commands/custom/merge/merge.command';
import { PullCommand } from './commands/custom/pull/pull.command';
import { PushCommand } from './commands/custom/push/push.command';
import { RevertCommand } from './commands/custom/revert/revert.command';
import { RunCommand } from './commands/custom/run/run.command';
import { SyncCommand } from './commands/custom/sync/sync.command';
import { ValidateCommand } from './commands/custom/validate/validate.command';

export const appCommands = [
  // base
  DefinitionsCommand,
  HelpCommand,
  VersionCommand,
  // custom
  CommitCommand,
  CreateBranchCommand,
  DeleteBranchCommand,
  GetBranchesCommand,
  GetModelCommand,
  GetQueryInfoCommand,
  GetSampleCommand,
  GetSchemasCommand,
  GetSkillsCommand,
  GetConnectionsListCommand,
  GetStateCommand,
  MergeCommand,
  PullCommand,
  PushCommand,
  RevertCommand,
  RunCommand,
  SyncCommand,
  ValidateCommand
];
