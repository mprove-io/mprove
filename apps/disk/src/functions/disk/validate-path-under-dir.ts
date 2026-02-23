import path from 'node:path';
import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';

export function validatePathUnderDir(item: {
  fullPath: string;
  allowedDir: string;
}) {
  let resolvedDir = path.resolve(item.allowedDir);
  let resolvedPath = path.resolve(item.fullPath);

  if (
    resolvedPath !== resolvedDir &&
    !resolvedPath.startsWith(resolvedDir + path.sep)
  ) {
    throw new ServerError({ message: ErEnum.DISK_PATH_TRAVERSAL });
  }
}
