import { Cli } from 'clipanion';
import 'reflect-metadata';
import { common } from './barrels/common';
import { nodeCommon } from './barrels/node-common';
import { DefinitionsCommand } from './commands/base/definitions/definitions';
import { HelpCommand } from './commands/base/help/help';
import { VersionCommand } from './commands/base/version/version';
import { PullRepoCommand } from './commands/custom/pull-repo/pull-repo';
import { RevertRepoCommand } from './commands/custom/revert-repo/revert-repo';
import { RunDashboardsCommand } from './commands/custom/run-dashboards/run-dashboards';
import { RunVisualizationsCommand } from './commands/custom/run-visualizations/run-visualizations';
import { SyncRepoCommand } from './commands/custom/sync-repo/sync-repo';
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
  PullRepoCommand,
  RevertRepoCommand,
  RunDashboardsCommand,
  RunVisualizationsCommand,
  SyncRepoCommand
];

let customContext: CustomContext = {
  ...Cli.defaultContext,
  config: undefined
};

Cli.from(appCommands, {
  enableCapture: false,
  enableColors: true,
  binaryLabel: 'Mprove CLI',
  binaryName: 'mprove',
  binaryVersion: require('../../../package.json').version
}).runExit(process.argv.slice(2), customContext);
