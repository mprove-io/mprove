import * as fse from 'fs-extra';
import { config } from '../../barrels/config';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function isRepoExistOnDisk(item: {
  project_id: string;
  repo_id: string;
}) {
  let repoDir = `${config.DISK_BACKEND_PROJECTS_PATH}/${item.project_id}/${item.repo_id}`;

  let isExist = await fse
    .pathExists(repoDir)
    .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_PATH_EXISTS_CHECK));

  return isExist;
}
