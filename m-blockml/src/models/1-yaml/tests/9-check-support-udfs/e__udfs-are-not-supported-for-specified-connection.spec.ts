import { api } from '../../../../barrels/api';
import { helper } from '../../../../barrels/helper';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { prepareTest } from '../../../../functions/prepare-test';

let pack = '1-yaml';
let func = '9-check-support-udfs';
let testId = 'e__udfs-are-not-supported-for-specified-connection';

test(testId, async () => {
  let filesAny: any[];
  let errors: interfaces.BmErrorC[];

  try {
    let { structService, structId, dataDir, logPath } = await prepareTest(
      pack,
      func,
      testId
    );

    let connection1: api.ProjectConnection = {
      name: 'c1',
      type: api.ConnectionTypeEnum.PostgreSQL
    };
    let connection2: api.ProjectConnection = {
      name: 'c2',
      type: api.ConnectionTypeEnum.BigQuery
    };

    await structService.rebuildStruct({
      dir: dataDir,
      structId: structId,
      projectId: 'p1',
      connections: [connection1, connection2],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    filesAny = await helper.readLog(logPath, enums.LogEnum.FilesAny);
    errors = await helper.readLog(logPath, enums.LogEnum.Errors);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(filesAny.length).toBe(2);

  expect(errors.length).toBe(2);
  expect(errors[0].title).toBe(
    enums.ErTitleEnum.UDFS_ARE_NOT_SUPPORTED_FOR_SPECIFIED_CONNECTION
  );
  expect(errors[0].lines[0].line).toBe(3);
  expect(errors[1].title).toBe(
    enums.ErTitleEnum.UDFS_ARE_NOT_SUPPORTED_FOR_SPECIFIED_CONNECTION
  );
  expect(errors[1].lines[0].line).toBe(3);
});
