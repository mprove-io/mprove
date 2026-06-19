import test from 'ava';
import fse from 'fs-extra';
import { logToConsoleBlockml } from '#blockml/functions/extra/log-to-console-blockml';
import { prepareTest } from '#blockml/functions/extra/prepare-test';
import { readLog } from '#blockml/functions/extra/read-log';
import { BmError } from '#blockml/models/bm-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';

let caller = CallerEnum.BuildSpace;
let func = FuncEnum.BuildSpaceAccessRoles;
let testId = 'v__space-folders-access-roles-combined';

test('1', async t => {
  let errors: BmError[];
  let spaces: FilePartSpace[];

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

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: PROJECT_ENV_PROD,
      evs: [],
      projectConnections: [],
      overrideTimezone: undefined
    });

    errors = await readLog(fromDir, LogTypeEnum.Errors);
    spaces = await readLog(fromDir, LogTypeEnum.Spaces);
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
  t.deepEqual(spaces[0].accessRolesCombined, ['r1']);
  t.deepEqual(spaces[1].accessRolesCombined, ['r2', 'r1']);
  t.deepEqual(spaces[2].accessRolesCombined, ['r2', 'r1']);
});
