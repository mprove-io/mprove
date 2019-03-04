import * as fse from 'fs-extra';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function writeToFile(item: { file_absolute_id: string, content: string }) {

  await fse.writeFile(item.file_absolute_id, item.content)
    .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_WRITE_FILE));
}
