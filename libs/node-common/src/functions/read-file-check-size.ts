import * as fse from 'fs-extra';
import { common } from '~disk/barrels/common';

export async function readFileCheckSize(filePath: string) {
  let stat = <fse.Stats>await fse.stat(filePath);
  let fileSizeInBytes = stat.size;
  let fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

  if (fileSizeInMegabytes > 5) {
    throw new common.ServerError({
      message: common.ErEnum.DISK_FILE_SIZE_IS_TOO_BIG
    });
  }

  let content = <string>await fse.readFile(filePath, 'utf8');
  return content;
}
