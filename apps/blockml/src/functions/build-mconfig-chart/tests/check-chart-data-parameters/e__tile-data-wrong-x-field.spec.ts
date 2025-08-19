import test from 'ava';
import * as fse from 'fs-extra';
import { logToConsoleBlockml } from '~blockml/functions/extra/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/extra/prepare-test';
import { readLog } from '~blockml/functions/extra/read-log';
import { BmError } from '~blockml/models/bm-error';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { FileDashboard } from '~common/interfaces/blockml/internal/file-dashboard';
import { ProjectConnection } from '~common/interfaces/blockml/project-connection';

let caller = CallerEnum.BuildDashboardTileCharts;
let func = FuncEnum.CheckChartDataParameters;
let testId = 'e__tile-data-wrong-x-field';

test('1', async t => {
  let errors: BmError[];
  let entDashboards: FileDashboard[];

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
      type: ConnectionTypeEnum.Api
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: PROJECT_ENV_PROD,
      evs: [],
      connections: [connection],
      overrideTimezone: undefined
    });

    errors = await readLog(fromDir, LogTypeEnum.Errors);
    entDashboards = await readLog(fromDir, LogTypeEnum.Entities);
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
  t.is(entDashboards.length, 0);

  t.is(errors[0].title, ErTitleEnum.TILE_DATA_WRONG_X_FIELD);
  t.is(errors[0].lines[0].line, 9);
});
