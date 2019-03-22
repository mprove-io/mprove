import * as nodegit from 'nodegit';
import { config } from '../../barrels/config';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function revertRepoToLastCommit(item: {
  project_id: string;
  repo_id: string;
}) {
  let repoPath = `${config.DISK_BACKEND_PROJECTS_PATH}/${item.project_id}/${
    item.repo_id
  }`;

  let gitRepo = <nodegit.Repository>(
    await nodegit.Repository.open(repoPath).catch(e =>
      helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_OPEN)
    )
  );

  let ourCommit = <nodegit.Commit>(
    await gitRepo
      .getReferenceCommit('refs/heads/master')
      .catch(e =>
        helper.reThrow(
          e,
          enums.nodegitErrorsEnum.NODEGIT_REPO_GET_REFERENCE_COMMIT
        )
      )
  );

  await nodegit.Reset.reset(
    gitRepo,
    <any>ourCommit,
    nodegit.Reset.TYPE.HARD,
    null
  ).catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_RESET_RESET));
}
