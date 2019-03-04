import * as fse from 'fs-extra';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function removePath(absolutePath: string) {
  let isExist = await fse
    .pathExists(absolutePath)
    .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_PATH_EXISTS_CHECK));

  if (isExist) {
    await fse
      .remove(absolutePath)
      .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_REMOVE));
  }
}
