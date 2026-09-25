import { DefinitionsCommand } from './commands/base/definitions/definitions';
import { HelpCommand } from './commands/base/help/help';
import { VersionCommand } from './commands/base/version/version';
import { CommitCommand } from './commands/custom/commit/commit';
import { CreateBranchCommand } from './commands/custom/create-branch/create-branch';
import { DeleteBranchCommand } from './commands/custom/delete-branch/delete-branch';
import { GetBranchesCommand } from './commands/custom/get-branches/get-branches';
import { GetConnectionsListCommand } from './commands/custom/get-connections-list/get-connections-list';
import { GetModelCommand } from './commands/custom/get-model/get-model';
import { GetQueryInfoCommand } from './commands/custom/get-query-info/get-query-info';
import { GetSampleCommand } from './commands/custom/get-sample/get-sample';
import { GetSchemasCommand } from './commands/custom/get-schemas/get-schemas';
import { GetSkillsCommand } from './commands/custom/get-skills/get-skills';
import { GetStateCommand } from './commands/custom/get-state/get-state';
import { MergeCommand } from './commands/custom/merge/merge';
import { PullCommand } from './commands/custom/pull/pull';
import { PushCommand } from './commands/custom/push/push';
import { RevertCommand } from './commands/custom/revert/revert';
import { RunCommand } from './commands/custom/run/run';
import { SyncCommand } from './commands/custom/sync/sync';
import { ValidateCommand } from './commands/custom/validate/validate';

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
