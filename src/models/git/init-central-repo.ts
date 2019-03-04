import * as nodegit from 'nodegit';
import { config } from '../../barrels/config';
import { constants } from '../../barrels/constants';
import { disk } from '../../barrels/disk';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function initCentralRepo(projectId: string) {

  let dirCentral = `${config.DISK_BASE_PATH}/${projectId}/${constants.CENTRAL_REPO_ID}`;

  await disk.ensureDir(dirCentral)
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_ENSURE_DIR));

  let isBare = 1;

  let gitRepo = <nodegit.Repository>await nodegit.Repository.init(dirCentral, isBare)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INIT));
}
