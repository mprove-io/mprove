import { ApStruct } from '../../src/barrels/ap-struct';
import { api } from '../../src/barrels/api';
import { interfaces } from '../../src/barrels/interfaces';

// yarn jest test/manual/ma1_struct.test.ts

jest.setTimeout(30000);
test('testName', () => {
  expect.assertions(1);

  return ApStruct.rebuildStruct({
    dir: 'test/manual/ma1',
    weekStart: api.ProjectWeekStartEnum.Monday,
    bqProject: 'flow-1202',
    projectId: 'unkProjectId',
    structId: 'unkStructId'
  }).then((struct: interfaces.Struct) => {
    expect(1).toEqual(1);
  });
});
