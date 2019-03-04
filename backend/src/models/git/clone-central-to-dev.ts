import * as nodegit from 'nodegit';
import { config } from '../../barrels/config';
import { constants } from '../../barrels/constants';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { constantFetchOptions } from './_constant-fetch-options';

export async function cloneCentralToDev(item: {
  project_id: string;
  dev_repo_id: string;
}) {
  let dirCentral = `${config.DISK_BASE_PATH}/${item.project_id}/${
    constants.CENTRAL_REPO_ID
  }`;
  let dirDev = `${config.DISK_BASE_PATH}/${item.project_id}/${
    item.dev_repo_id
  }`;

  let cloneOptions = { fetchOpts: constantFetchOptions };

  await nodegit.Clone.clone(dirCentral, dirDev, cloneOptions).catch(e =>
    helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_CLONE)
  );
}
