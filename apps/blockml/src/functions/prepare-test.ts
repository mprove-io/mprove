import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { SRC_PATH } from '#common/constants/top-blockml';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import {
  type PrepareTestOutput,
  prepareTest as prepareTestFromDirectory
} from './prepare-test/prepare-test';

// Compatibility entry point until the remaining tests pass their own directory.
export async function prepareTest(
  caller: CallerEnum,
  func: FuncEnum,
  testId: string,
  connection?: ProjectConnection,
  overrideConfigOptions?: Partial<BlockmlConfig>
): Promise<PrepareTestOutput> {
  let funcArray: string[] = func.toString().split('/');

  let pack = funcArray[0];

  let f = funcArray[1];

  let testsDir = `${SRC_PATH}/functions/${pack}/tests/${f}`;

  if (func === FuncEnum.MakeLineNumbers || func === FuncEnum.YamlToObjects) {
    testsDir = `${SRC_PATH}/functions/${f}/tests`;
  } else if (pack === 'build-yaml' || pack === 'build-spaces') {
    let buildDir = pack === 'build-spaces' ? 'build-space' : 'build-yaml';

    testsDir = `${SRC_PATH}/controllers/rebuild-struct/rebuild-struct-stateless/${buildDir}/${f}/tests`;
  }

  let output: PrepareTestOutput = await prepareTestFromDirectory({
    caller: caller,
    func: func,
    testId: testId,
    testsDir: testsDir,
    connection: connection,
    overrideConfigOptions: overrideConfigOptions
  });

  return output;
}
