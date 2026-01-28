import * as fse from 'fs-extra';
import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';

export async function readFileCheckSize(item: {
  filePath: string | URL;
  getStat: boolean;
}) {
  let { filePath, getStat } = item;

  let stat: fse.Stats = await fse.stat(filePath);
  let fileSizeInBytes = stat.size;
  let fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

  if (fileSizeInMegabytes > 5) {
    throw new ServerError({
      message: ErEnum.FILE_SIZE_IS_TOO_BIG
    });
  }

  let content = <string>await fse.readFile(filePath, 'utf8');

  return {
    content: content,
    stat: getStat === true ? stat : undefined
  };
}
