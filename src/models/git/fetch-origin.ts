import * as nodegit from 'nodegit';
import { config } from '../../barrels/config';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { constantFetchOptions } from './_constant-fetch-options';

export async function fetchOrigin(item: { project_id: string, repo_id: string }) {

  let repoPath = `${config.DISK_BASE_PATH}/${item.project_id}/${item.repo_id}`;

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoPath)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_OPEN));

  await gitRepo.fetch('origin', constantFetchOptions)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_FETCH));
}

