import * as nodegit from 'nodegit';
import { config } from '../../barrels/config';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function commit(item: {
  project_id: string,
  repo_id: string,
  user_id: string
}) {

  let repoPath = `${config.DISK_BASE_PATH}/${item.project_id}/${item.repo_id}`;

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoPath)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_OPEN));

  let index = <nodegit.Index>await gitRepo.index()
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_INDEX));

  let oid = <nodegit.Oid>await index.writeTree()
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_WRITE_TREE));

  let head = <nodegit.Oid>await nodegit.Reference.nameToId(gitRepo, 'HEAD')
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REFERENCE_NAME_TO_ID));

  let parent = <nodegit.Commit>await gitRepo.getCommit(head)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_GET_COMMIT));

  let author = nodegit.Signature.now('mprove user', item.user_id);

  let committer = nodegit.Signature.now('mprove server', 'support@mprove.io');

  await gitRepo.createCommit('HEAD', author, committer, 'message', oid, [parent])
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_CREATE_COMMIT));
}
