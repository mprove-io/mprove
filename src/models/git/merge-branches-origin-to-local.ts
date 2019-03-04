import * as nodegit from 'nodegit';
import { config } from '../../barrels/config';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function mergeBranchesOriginToLocal(item: {
  project_id: string,
  repo_id: string,
  user_id: string
}) {

  let repoPath = `${config.DISK_BASE_PATH}/${item.project_id}/${item.repo_id}`;

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoPath)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_OPEN));

  let signature = nodegit.Signature.now('mprove user', item.user_id);

  await gitRepo.mergeBranches('master', 'origin/master', signature, nodegit.Merge.PREFERENCE.NONE)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_MERGE_BRANCHES));
}

