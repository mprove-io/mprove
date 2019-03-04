import * as fse from 'fs-extra';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function emptyDir(dir: string) {

  await fse.emptyDir(dir)
    .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_EMPTY_DIR));
}
