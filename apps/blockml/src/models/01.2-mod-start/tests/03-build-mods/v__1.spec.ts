import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = common.CallerEnum.BuildModStart;
let func = common.FuncEnum.BuildMods;
let testId = 'v__1';

test('1', async t => {
  let errors: BmError[];
  let entMods: common.FileMod[];

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

    let c1: common.ProjectConnection = {
      connectionId: 'c1_postgres',
      type: common.ConnectionTypeEnum.PostgreSQL,
      host: cs.get<interfaces.Config['blockmlTestsDwhPostgresHost']>(
        'blockmlTestsDwhPostgresHost'
      ),
      port: Number(
        cs.get<interfaces.Config['blockmlTestsDwhPostgresPort']>(
          'blockmlTestsDwhPostgresPort'
        )
      ),
      username: cs.get<interfaces.Config['blockmlTestsDwhPostgresUsername']>(
        'blockmlTestsDwhPostgresUsername'
      ),
      password: cs.get<interfaces.Config['blockmlTestsDwhPostgresPassword']>(
        'blockmlTestsDwhPostgresPassword'
      ),
      databaseName: cs.get<
        interfaces.Config['blockmlTestsDwhPostgresDatabaseName']
      >('blockmlTestsDwhPostgresDatabaseName')
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [c1],
      overrideTimezone: undefined
    });

    errors = await helper.readLog(fromDir, common.LogTypeEnum.Errors);
    entMods = await helper.readLog(fromDir, common.LogTypeEnum.Mods);

    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(errors.length, 0);
  t.is(entMods.length, 1);
});
