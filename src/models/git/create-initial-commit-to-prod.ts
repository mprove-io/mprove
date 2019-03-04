import * as nodegit from 'nodegit';
import { config } from '../../barrels/config';
import { constants } from '../../barrels/constants';
import { disk } from '../../barrels/disk';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function createInitialCommitToProd(projectId: string) {

  let dirProd = `${config.DISK_BASE_PATH}/${projectId}/${constants.PROD_REPO_ID}`;

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(dirProd)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_OPEN));

  let fileName = 'readme.md';
  let fileAbsoluteId = `${dirProd}/${fileName}`;
  let content = `# ${projectId}`;

  await disk.writeToFile({
    file_absolute_id: fileAbsoluteId,
    content: content
  })
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_WRITE_TO_FILE));

  let index = <nodegit.Index>await gitRepo.refreshIndex()
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_REFRESH_INDEX));

  await index.addByPath(fileName)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_ADD_BY_PATH));

  await (<any>index.write()) // wrong @types - method is async
    .catch((e: any) => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_WRITE));

  let oid = <nodegit.Oid>await index.writeTree()
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_WRITE_TREE));

  let author = nodegit.Signature.now('mprove server', 'support@mprove.io');
  let committer = nodegit.Signature.now('mprove server', 'support@mprove.io');

  // Since we're creating an inital commit, it has no parents. Note that unlike
  // normal we don't get the head either, because there isn't one yet.
  await gitRepo.createCommit('HEAD', author, committer, 'message', oid, [])
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_CREATE_COMMIT));
}

