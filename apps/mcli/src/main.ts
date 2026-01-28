/// <reference path="./types.d.ts" />
import { Cli } from 'clipanion';
import 'reflect-metadata';
import { ErEnum } from '~common/enums/er.enum';
import { listenProcessEvents } from '~node-common/functions/listen-process-events';
import { DefinitionsCommand } from './commands/base/definitions/definitions';
import { HelpCommand } from './commands/base/help/help';
import { VersionCommand } from './commands/base/version/version';
import { CommitCommand } from './commands/custom/commit/commit';
import { CreateBranchCommand } from './commands/custom/create-branch/create-branch';
import { DeleteBranchCommand } from './commands/custom/delete-branch/delete-branch';
import { GetBranchesCommand } from './commands/custom/get-branches/get-branches';
import { GetQueryCommand } from './commands/custom/get-query/get-query';
import { GetStateCommand } from './commands/custom/get-state/get-state';
import { MergeCommand } from './commands/custom/merge/merge';
import { PullCommand } from './commands/custom/pull/pull';
import { PushCommand } from './commands/custom/push/push';
import { RevertCommand } from './commands/custom/revert/revert';
import { RunCommand } from './commands/custom/run/run';
import { SyncCommand } from './commands/custom/sync/sync';
import { ValidateCommand } from './commands/custom/validate/validate';
import { logToConsoleMcli } from './functions/log-to-console-mcli';
import { CustomContext } from './models/custom-command';

listenProcessEvents({
  appTerminated: ErEnum.MCLI_APP_TERMINATED,
  uncaughtException: ErEnum.MCLI_UNCAUGHT_EXCEPTION,
  unhandledRejectionReason: ErEnum.MCLI_UNHANDLED_REJECTION_REASON,
  unhandledRejection: ErEnum.MCLI_UNHANDLED_REJECTION_ERROR,
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
  GetQueryCommand,
  GetStateCommand,
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
  binaryVersion: require('package.json').version
}).runExit(process.argv.slice(2), customContext);
