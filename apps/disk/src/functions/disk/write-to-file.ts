import fse from 'fs-extra';
import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';

export async function writeToFile(item: { filePath: string; content: string }) {
  let { filePath, content } = item;

  let stat: fse.Stats | undefined;
  try {
    stat = await fse.lstat(filePath);
  } catch (e: any) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }

  if (stat?.isSymbolicLink() === true) {
    throw new ServerError({ message: ErEnum.FILE_IS_SYMLINK });
  }

  await fse.writeFile(filePath, content);
}
