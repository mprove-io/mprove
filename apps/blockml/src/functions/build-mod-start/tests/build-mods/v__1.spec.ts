import test from 'ava';
import * as fse from 'fs-extra';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = CallerEnum.BuildModStart;
let func = FuncEnum.BuildMods;
let testId = 'v__1';

test('1', async t => {
  let errors: BmError[];
  let entMods: FileMod[];

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

    let c1: ProjectConnection = {
      connectionId: 'c1_postgres',
      type: ConnectionTypeEnum.PostgreSQL,
      host: cs.get<BlockmlConfig['blockmlTestsDwhPostgresHost']>(
        'blockmlTestsDwhPostgresHost'
      ),
      port: Number(
        cs.get<BlockmlConfig['blockmlTestsDwhPostgresPort']>(
          'blockmlTestsDwhPostgresPort'
        )
      ),
      username: cs.get<BlockmlConfig['blockmlTestsDwhPostgresUsername']>(
        'blockmlTestsDwhPostgresUsername'
      ),
      password: cs.get<BlockmlConfig['blockmlTestsDwhPostgresPassword']>(
        'blockmlTestsDwhPostgresPassword'
      ),
      databaseName: cs.get<
        BlockmlConfig['blockmlTestsDwhPostgresDatabaseName']
      >('blockmlTestsDwhPostgresDatabaseName')
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: PROJECT_ENV_PROD,
      evs: [],
      connections: [c1],
      overrideTimezone: undefined
    });

    errors = await readLog(fromDir, LogTypeEnum.Errors);
    entMods = await readLog(fromDir, LogTypeEnum.Mods);

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

  t.is(errors.length, 0);
  t.is(entMods.length, 1);
});
