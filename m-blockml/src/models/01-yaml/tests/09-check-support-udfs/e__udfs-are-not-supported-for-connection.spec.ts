import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';
import { prepareTest } from '~/functions/prepare-test';
import test from 'ava';
import { BmError } from '~/models/bm-error';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildYaml;
let func = enums.FuncEnum.CheckSupportUdfs;
let testId = 'e__udfs-are-not-supported-for-connection';

test('1', async t => {
  let errors: BmError[];
  let filesAny: any[];

  try {
    let {
      structService,
      traceId,
      structId,
      dataDir,
      fromDir,
      toDir
    } = await prepareTest(caller, func, testId);

    let connection1: api.ProjectConnection = {
      name: 'c1',
      type: api.ConnectionTypeEnum.PostgreSQL
    };
    let connection2: api.ProjectConnection = {
      name: 'c2',
      type: api.ConnectionTypeEnum.BigQuery
    };

    await structService.rebuildStruct({
      traceId: traceId,
      dir: dataDir,
      structId: structId,
      connections: [connection1, connection2],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    filesAny = await helper.readLog(fromDir, enums.LogTypeEnum.FilesAny);
    if (helper.isDefined(toDir)) {
      fse.copySync(fromDir, toDir);
    }
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(errors.length, 2);
  t.is(filesAny.length, 2);

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
