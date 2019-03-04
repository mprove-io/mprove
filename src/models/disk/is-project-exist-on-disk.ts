import * as fse from 'fs-extra';
import { config } from '../../barrels/config';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function isProjectExistOnDisk(projectId: string) {

  let projectDir = `${config.DISK_BASE_PATH}/${projectId}`;

  let isExist = await fse.pathExists(projectDir)
    .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_PATH_EXISTS_CHECK));

  return isExist;
}
