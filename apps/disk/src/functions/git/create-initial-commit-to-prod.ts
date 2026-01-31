import { simpleGit } from 'simple-git';

import {
  BRANCH_MAIN,
  MPROVE_CONFIG_FILENAME,
  README_FILE_NAME
} from '#common/constants/top';
import { TEST_PROJECTS } from '#common/constants/top-disk';
import { isDefined } from '#common/functions/is-defined';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { copyPath } from '../disk/copy-path';
import { isPathExist } from '../disk/is-path-exist';
import { writeToFile } from '../disk/write-to-file';

export async function createInitialCommitToProd(item: {
  prodDir: string;
  projectId: string;
  testProjectId: string;
  projectName: string;
  userAlias: string;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.createInitialCommitToProd',
    fn: async () => {
      let git = simpleGit({ baseDir: item.prodDir });

      let sourceDir = `${TEST_PROJECTS}/${item.testProjectId}`;

      let isSourceExist = await isPathExist(sourceDir);

      if (isDefined(item.testProjectId) && isSourceExist) {
        await copyPath({
          sourcePath: sourceDir,
          destinationPath: item.prodDir
        });
      } else {
        let readmeFileName = README_FILE_NAME;
        let readmeFilePath = `${item.prodDir}/${readmeFileName}`;
        let readmeContent = `# ${item.projectName} project`;

        await writeToFile({
          filePath: readmeFilePath,
          content: readmeContent
        });

        let mproveFileName = MPROVE_CONFIG_FILENAME;
        let mproveFilePath = `${item.prodDir}/${mproveFileName}`;
        let mproveContent = `mprove_dir: ./
case_sensitive_string_filters: false
format_number: ''
thousands_separator: ','
currency_prefix: '$'
currency_suffix: ''
`;

        await writeToFile({
          filePath: mproveFilePath,
          content: mproveContent
        });
      }

      await git.add('.');

      let message = 'init';

      await git.commit(message, {
        '--author': `${item.userAlias} <${item.userAlias}@>`
      });

      await git.branch(['-M', BRANCH_MAIN]);
    }
  });
}
