import test from 'ava';
import fse from 'fs-extra';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { logToConsoleBlockml } from '#blockml/functions/extra/log-to-console-blockml';
import { prepareTest } from '#blockml/functions/extra/prepare-test';
import { readLog } from '#blockml/functions/extra/read-log';
import { BmError } from '#blockml/models/bm-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';

let caller = CallerEnum.BuildModStart;
let func = FuncEnum.CheckModSpaces;
let testId = 'e__space-does-not-exist__model';

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
    configService = cs;

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
      projectConnections: [c1],
      overrideTimezone: undefined
    });

    errors = await readLog(fromDir, LogTypeEnum.Errors);
    entMods = await readLog(fromDir, LogTypeEnum.Entities);

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
  t.is(entMods.length, 1);
  t.is(errors[0].title, ErTitleEnum.SPACE_DOES_NOT_EXIST);
  t.is(errors[0].lines[0].line, 0);
});
