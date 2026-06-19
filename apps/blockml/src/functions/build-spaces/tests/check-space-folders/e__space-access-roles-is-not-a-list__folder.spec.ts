import test from 'ava';
import fse from 'fs-extra';
import { prepareTest } from '#blockml/functions/extra/prepare-test';
import { readLog } from '#blockml/functions/extra/read-log';
import type { BmError } from '#blockml/models/bm-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';

let caller = CallerEnum.BuildSpace;
let func = FuncEnum.CheckSpaceFolders;
let testId = 'e__space-access-roles-is-not-a-list__folder';

test('1', async t => {
  let { structService, traceId, structId, dataDir, fromDir, toDir } =
    await prepareTest(caller, func, testId);

  await structService.rebuildStruct({
    traceId: traceId,
    dir: dataDir,
    structId: structId,
    envId: PROJECT_ENV_PROD,
    evs: [],
    projectConnections: [],
    overrideTimezone: undefined
  });

  let errors: BmError[] = await readLog(fromDir, LogTypeEnum.Errors);
  let filesAny: any[] = await readLog(fromDir, LogTypeEnum.Spaces);
  let isToDirDefined = isDefined(toDir);
  if (isToDirDefined) {
    fse.copySync(fromDir, toDir);
  }

  t.is(errors.length, 1);
  t.is(filesAny.length, 0);
  t.is(errors[0].title, ErTitleEnum.PARAMETER_IS_NOT_A_LIST);
  t.is(errors[0].lines[0].line, 4);
});
