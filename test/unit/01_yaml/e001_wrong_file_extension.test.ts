import { AmError } from '../../../src/barrels/am-error';
import { ApStruct } from '../../../src/barrels/ap-struct';
import { api } from '../../../src/barrels/api';
import { interfaces } from '../../../src/barrels/interfaces';

// yarn jest test/unit/01_yaml/e001_wrong_file_extension.test.ts
jest.setTimeout(30000);
test('testName', () => {
  expect.assertions(1);

  return ApStruct.rebuildStruct({
    dir: 'test/unit/01_yaml/e1',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    const desiredError: AmError = {
      id: struct.errors[0].id,
      lines: [
        {
          line: 0,
          name: 'e1.yaml',
          path: 'e1.yaml'
        }
      ],
      title: `wrong file extension`,
      message: `valid BlockML file extensions are: .udf .view .model .dashboard .md`
    };

    expect(struct.errors[0]).toMatchObject(desiredError);
  });
});
