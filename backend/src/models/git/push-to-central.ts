import * as nodegit from 'nodegit';
import { config } from '../../barrels/config';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { constantFetchOptions } from './_constant-fetch-options';

export async function pushToCentral(item: {
  project_id: string;
  from_repo_id: string;
}) {
  let repoPath = `${config.DISK_BASE_PATH}/${item.project_id}/${
    item.from_repo_id
  }`;

  let gitRepo = <nodegit.Repository>(
    await nodegit.Repository.open(repoPath).catch(e =>
      helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_OPEN)
    )
  );

  let originRemote = <nodegit.Remote>(
    await gitRepo
      .getRemote('origin')
      .catch(e =>
        helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_GET_REMOTE)
      )
  );

  await originRemote
    .push(['refs/heads/master:refs/heads/master'], constantFetchOptions)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REMOTE_PUSH));
}
