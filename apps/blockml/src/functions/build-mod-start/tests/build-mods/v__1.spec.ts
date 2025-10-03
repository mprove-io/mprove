import test from 'ava';
import * as fse from 'fs-extra';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { logToConsoleBlockml } from '~blockml/functions/extra/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/extra/prepare-test';
import { readLog } from '~blockml/functions/extra/read-log';
import { BmError } from '~blockml/models/bm-error';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { FileMod } from '~common/interfaces/blockml/internal/file-mod';

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
      options: {
        postgres: {
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
          database: cs.get<
            BlockmlConfig['blockmlTestsDwhPostgresDatabaseName']
          >('blockmlTestsDwhPostgresDatabaseName'),
          isSSL: false
        }
      }
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
