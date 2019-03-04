import { config } from '../../barrels/config';
import { constants } from '../../barrels/constants';
import { disk } from '../../barrels/disk';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { cloneCentralToProd } from './clone-central-to-prod';
import { createInitialCommitToProd } from './create-initial-commit-to-prod';
import { initCentralRepo } from './init-central-repo';
import { pushToCentral } from './push-to-central';

export async function prepareCentralAndProd(projectId: string) {

  let centralDir = `${config.DISK_BASE_PATH}/${projectId}/${constants.CENTRAL_REPO_ID}`;
  let prodDir = `${config.DISK_BASE_PATH}/${projectId}/${constants.PROD_REPO_ID}`;

  await disk.emptyDir(centralDir)
  .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_EMPTY_DIR));

  await disk.emptyDir(prodDir)
  .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_EMPTY_DIR));

  await initCentralRepo(projectId)
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_INIT_CENTRAL_REPO));

  await cloneCentralToProd(projectId)
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_CLONE_CENTRAL_TO_PROD));

  await createInitialCommitToProd(projectId)
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_CREATE_INITIAL_COMMIT_TO_PROD));

  await pushToCentral({
    project_id: projectId,
    from_repo_id: constants.PROD_REPO_ID,
  })
    .catch(e => helper.reThrow(e, enums.gitErrorsEnum.GIT_PUSH_TO_CENTRAL));
}
