import path from 'node:path';
import { ServerError } from '#common/models/server-error';

export function validatePathUnderDir(item: {
  fullPath: string;
  allowedDir: string;
  displayPath?: string;
}) {
  let { fullPath, allowedDir, displayPath } = item;

  let resolvedDir = path.resolve(allowedDir);
  let resolvedPath = path.resolve(fullPath);

  let isInsideDir =
    resolvedPath === resolvedDir ||
    resolvedPath.startsWith(`${resolvedDir}${path.sep}`);

  if (isInsideDir === false) {
    throw new ServerError({
      message: 'DISK_PATH_TRAVERSAL',
      displayData:
        displayPath === undefined
          ? undefined
          : {
              path: displayPath
            }
    });
  }

  return resolvedPath;
}
