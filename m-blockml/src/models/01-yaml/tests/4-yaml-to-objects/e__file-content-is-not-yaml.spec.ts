import { api } from '../../../../barrels/api';
import { helper } from '../../../../barrels/helper';
import { enums } from '../../../../barrels/enums';
import { interfaces } from '../../../../barrels/interfaces';
import { prepareTest } from '../../../../functions/prepare-test';
import * as fse from 'fs-extra';

let caller = enums.CallerEnum.BuildYaml;
let func = enums.FuncEnum.YamlToObjects;
let testId = 'e__file-content-is-not-yaml';

test(testId, async () => {
  let errors: interfaces.BmErrorC[];
  let filesAny: any[];

  try {
    let {
      structService,
      structId,
      dataDir,
      fromDir,
      toDir
    } = await prepareTest(caller, func, testId);

    await structService.rebuildStruct({
      dir: dataDir,
      structId: structId,
      projectId: 'p1',
      connections: [],
      weekStart: api.ProjectWeekStartEnum.Monday
    });

    errors = await helper.readLog(fromDir, enums.LogTypeEnum.Errors);
    filesAny = await helper.readLog(fromDir, enums.LogTypeEnum.FilesAny);
    fse.copySync(fromDir, toDir);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(errors.length).toBe(1);
  expect(filesAny.length).toBe(0);

  expect(errors[0].title).toBe(enums.ErTitleEnum.FILE_CONTENT_IS_NOT_YAML);
  expect(errors[0].lines[0].line).toBe(0);
});