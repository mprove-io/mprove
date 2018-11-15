import * as fse from 'fs-extra';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function removePath(absolutePath: string) {
  await fse
    .remove(absolutePath)
    .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_REMOVE));
}
