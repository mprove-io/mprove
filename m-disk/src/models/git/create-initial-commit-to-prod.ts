import * as nodegit from 'nodegit';
import { disk } from '~/barrels/disk';
import { helper } from '~/barrels/helper';
import { constants } from '~/barrels/constants';
import { api } from '~/barrels/api';

export async function createInitialCommitToProd(item: {
  prodDir: string;
  projectId: string;
  useData: boolean;
  userAlias: string;
}) {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.prodDir);

  let sourceDir = `${constants.TEST_PROJECTS}/${item.projectId}`;

  let isSourceExist = await disk.isPathExist(sourceDir);

  if (item.useData && isSourceExist) {
    await disk.copyPath({
      sourcePath: sourceDir,
      destinationPath: item.prodDir
    });
  } else {
    let fileName = api.README_FILE_NAME;
    let filePath = `${item.prodDir}/${fileName}`;

    let projectName = helper.capitalizeFirstLetter(item.projectId);
    let content = `# ${projectName}`;

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
