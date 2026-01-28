import test from 'ava';
import * as fse from 'fs-extra';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { ProjectConnection } from '#common/interfaces/backend/project-connection';
import { FileStore } from '#common/interfaces/blockml/internal/file-store';
import { logToConsoleBlockml } from '~blockml/functions/extra/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/extra/prepare-test';
import { readLog } from '~blockml/functions/extra/read-log';
import { BmError } from '~blockml/models/bm-error';

let caller = CallerEnum.BuildStoreStart;
let func = FuncEnum.CheckResultFractionTypes;
let testId = 'e__controls-options-unexpected-list';

test('1', async t => {
  let errors: BmError[];
  let entStores: FileStore[];

  let wLogger;
  let configService;

  try {
    let {
      structService,
      traceId,
      structId,
      dataDir,
      fromDir,
      toDir,
      logger,
      cs
    } = await prepareTest(caller, func, testId);

    wLogger = logger;

    let connection: ProjectConnection = {
      connectionId: 'c1',
      options: {},
      type: ConnectionTypeEnum.Api
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: PROJECT_ENV_PROD,
      evs: [],
      projectConnections: [connection],
      overrideTimezone: undefined
    });

    errors = await readLog(fromDir, LogTypeEnum.Errors);
    entStores = await readLog(fromDir, LogTypeEnum.Stores);
    if (isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(errors.length, 1);
  t.is(entStores.length, 0);

  t.is(errors[0].title, ErTitleEnum.UNEXPECTED_LIST);
  t.is(errors[0].lines[0].line, 11);
});
