import * as nodegit from 'nodegit';
import { common } from '~disk/barrels/common';
import { constants } from '~disk/barrels/constants';
import { disk } from '~disk/barrels/disk';

export async function createInitialCommitToProd(item: {
  prodDir: string;
  projectId: string;
  testProjectId: string;
  projectName: string;
  userAlias: string;
}) {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.prodDir);

  let sourceDir = `${constants.TEST_PROJECTS}/${item.testProjectId}`;

  let isSourceExist = await disk.isPathExist(sourceDir);

  if (common.isDefined(item.testProjectId) && isSourceExist) {
    await disk.copyPath({
      sourcePath: sourceDir,
      destinationPath: item.prodDir
    });
  } else {
    let fileName = common.README_FILE_NAME;
    let filePath = `${item.prodDir}/${fileName}`;

    let content = `# ${item.projectName} project`;

    await disk.writeToFile({
      filePath: filePath,
      content: content
    });
  }

  let index = <nodegit.Index>await gitRepo.refreshIndex();

  await index.addAll(undefined, undefined);

  await (<any>index.write()); // wrong @types - method is async

  let oid = <nodegit.Oid>await index.writeTree();

  let author = nodegit.Signature.now(item.userAlias, `${item.userAlias}@`);
  let committer = nodegit.Signature.now(item.userAlias, `${item.userAlias}@`);

  let message = 'init';

  // Since we're creating an initial commit, it has no parents. Note that unlike
  // normal we don't get the head either, because there isn't one yet.
  await gitRepo.createCommit('HEAD', author, committer, message, oid, []);
}
