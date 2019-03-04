import * as fse from 'fs-extra';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

// auto creates new folders in path
export async function ensureFile(fileAbsoluteId: string) {
  await fse
    .ensureFile(fileAbsoluteId)
    .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_ENSURE_FILE));
}
