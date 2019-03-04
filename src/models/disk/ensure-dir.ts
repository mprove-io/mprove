import * as fse from 'fs-extra';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function ensureDir(projectDir: string) {
  await fse
    .ensureDir(projectDir)
    .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_ENSURE_DIR));
}
