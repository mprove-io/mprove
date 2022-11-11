import test from 'ava';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { logToConsoleBlockml } from '~blockml/functions/log-to-console-blockml';
import { prepareTest } from '~blockml/functions/prepare-test';
import { BmError } from '~blockml/models/bm-error';

let caller = enums.CallerEnum.BuildYaml;
let func = enums.FuncEnum.CheckSupportUdfs;
let testId = 'e__udfs-are-not-supported-for-connection';

test('1', async t => {
  let errors: BmError[];
  let filesAny: any[];

  try {
    let { structService, traceId, structId, dataDir, fromDir, toDir } =
      await prepareTest(caller, func, testId);

    let connection1: common.ProjectConnection = {
      connectionId: 'c1',
      type: common.ConnectionTypeEnum.PostgreSQL
    };
    let connection2: common.ProjectConnection = {
      connectionId: 'c2',
      type: common.ConnectionTypeEnum.BigQuery
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      envId: common.PROJECT_ENV_PROD,
      evs: [],
      connections: [connection1, connection2]
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    filesAny = await helper.readLog(fromDir, enums.LogTypeEnum.FilesAny);
    if (common.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    logToConsoleBlockml(e);
  }

  t.is(errors.length, 2);
  t.is(filesAny.length, 3);

  t.is(
    errors[0].title,
    enums.ErTitleEnum.UDFS_ARE_NOT_SUPPORTED_FOR_CONNECTION
  );
  t.is(errors[0].lines[0].line, 3);
  t.is(
    errors[1].title,
    enums.ErTitleEnum.UDFS_ARE_NOT_SUPPORTED_FOR_CONNECTION
  );
  t.is(errors[1].lines[0].line, 3);
});
