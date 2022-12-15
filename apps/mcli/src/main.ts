import { Cli } from 'clipanion';
import 'reflect-metadata';
import { common } from './barrels/common';
import { nodeCommon } from './barrels/node-common';
import { DefinitionsCommand } from './commands/base/definitions/definitions';
import { HelpCommand } from './commands/base/help/help';
import { VersionCommand } from './commands/base/version/version';
import { CommitCommand } from './commands/custom/commit/commit';
import { CreateBranchCommand } from './commands/custom/create-branch/create-branch';
import { DeleteBranchCommand } from './commands/custom/delete-branch/delete-branch';
import { GetBranchesCommand } from './commands/custom/get-branches/get-branches';
import { GetStatusCommand } from './commands/custom/get-status/get-status';
import { MergeCommand } from './commands/custom/merge/merge';
import { PullCommand } from './commands/custom/pull/pull';
import { PushCommand } from './commands/custom/push/push';
import { RevertCommand } from './commands/custom/revert/revert';
import { RunCommand } from './commands/custom/run/run';
import { SyncCommand } from './commands/custom/sync/sync';
import { ValidateCommand } from './commands/custom/validate/validate';
import { logToConsoleMcli } from './functions/log-to-console-mcli';
import { CustomContext } from './models/custom-command';

nodeCommon.listenProcessEvents({
  appTerminated: common.ErEnum.MCLI_APP_TERMINATED,
  uncaughtException: common.ErEnum.MCLI_UNCAUGHT_EXCEPTION,
  unhandledRejectionReason: common.ErEnum.MCLI_UNHANDLED_REJECTION_REASON,
  unhandledRejection: common.ErEnum.MCLI_UNHANDLED_REJECTION_ERROR,
  logToConsoleFn: logToConsoleMcli
});

let appCommands = [
  // base
  DefinitionsCommand,
  HelpCommand,
  VersionCommand,
  // custom
  CommitCommand,
  CreateBranchCommand,
  DeleteBranchCommand,
  GetBranchesCommand,
  GetStatusCommand,
  MergeCommand,
  PullCommand,
  PushCommand,
  RevertCommand,
  RunCommand,
  SyncCommand,
  ValidateCommand
];

let customContext: CustomContext = {
  ...Cli.defaultContext,
  config: undefined,
  loginToken: undefined
};

Cli.from(appCommands, {
  enableCapture: false,
  enableColors: true,
  binaryLabel: 'Mprove CLI',
  binaryName: 'mprove',
  binaryVersion: require('../../../package.json').version
}).runExit(process.argv.slice(2), customContext);
