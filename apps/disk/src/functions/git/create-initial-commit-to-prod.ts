import * as nodegit from '@figma/nodegit';

import {
  BRANCH_MAIN,
  MPROVE_CONFIG_FILENAME,
  README_FILE_NAME
} from '~common/constants/top';
import { TEST_PROJECTS } from '~common/constants/top-disk';
import { isDefined } from '~common/functions/is-defined';
import { addTraceSpan } from '~node-common/functions/add-trace-span';
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
      let gitRepo = <nodegit.Repository>(
        await nodegit.Repository.open(item.prodDir)
      );

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

      let index = <nodegit.Index>await gitRepo.refreshIndex();

      await index.addAll(undefined, undefined);

      await (<any>index.write()); // wrong @types - method is async

      let oid = <nodegit.Oid>await index.writeTree();

      let author = nodegit.Signature.now(item.userAlias, `${item.userAlias}@`);
      let committer = nodegit.Signature.now(
        item.userAlias,
        `${item.userAlias}@`
      );

      let message = 'init';

      // Since we're creating an initial commit, it has no parents. Note that unlike
      // normal we don't get the head either, because there isn't one yet.
      // createCommit('HEAD', author, committer, message, oid, []);
      let commitOid = await gitRepo.createCommit(
        null,
        author,
        committer,
        message,
        oid,
        []
      );

      await gitRepo.createBranch(BRANCH_MAIN, commitOid, false);

      await gitRepo.setHead(`refs/heads/${BRANCH_MAIN}`);
    }
  });
}
