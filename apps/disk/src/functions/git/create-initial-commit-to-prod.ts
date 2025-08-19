import * as nodegit from '@figma/nodegit';

import {
  BRANCH_MAIN,
  MPROVE_CONFIG_FILENAME,
  README_FILE_NAME
} from '~common/constants/top';
import { TEST_PROJECTS } from '~common/constants/top-disk';
import { isDefined } from '~common/functions/is-defined';
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
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.prodDir);

  let sourceDir = `${TEST_PROJECTS}/${item.testProjectId}`;

  let isSourceExist = await isPathExist(sourceDir);

  // console.log('isSourceExist');
  // console.log(isSourceExist);

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
week_start: Monday    
allow_timezones: true
default_timezone: UTC
format_number: ',.0f'
currency_prefix: $
currency_suffix: ''
case_sensitive_string_filters: false
simplify_safe_aggregates: true
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
  let committer = nodegit.Signature.now(item.userAlias, `${item.userAlias}@`);

  let message = 'init';

  // // Since we're creating an initial commit, it has no parents. Note that unlike
  // // normal we don't get the head either, because there isn't one yet.
  let commitOid = await gitRepo.createCommit(
    null,
    author,
    committer,
    message,
    oid,
    []
  );
  // await gitRepo.createCommit('HEAD', author, committer, message, oid, []);

  await gitRepo.createBranch(BRANCH_MAIN, commitOid, false);

  await gitRepo.setHead(`refs/heads/${BRANCH_MAIN}`);
}
