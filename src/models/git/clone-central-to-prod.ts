import * as nodegit from 'nodegit';
import { config } from '../../barrels/config';
import { constants } from '../../barrels/constants';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { constantFetchOptions } from './_constant-fetch-options';

export async function cloneCentralToProd(projectId: string) {
  let dirCentral = `${config.DISK_BASE_PATH}/${projectId}/${
    constants.CENTRAL_REPO_ID
  }`;
  let dirProd = `${config.DISK_BASE_PATH}/${projectId}/${
    constants.PROD_REPO_ID
  }`;

  let cloneOptions = { fetchOpts: constantFetchOptions };

  await nodegit.Clone.clone(dirCentral, dirProd, cloneOptions).catch(e =>
    helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_CLONE)
  );
}
