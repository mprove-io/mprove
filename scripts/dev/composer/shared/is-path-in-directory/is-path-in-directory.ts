import { isAbsolute, relative, sep } from 'node:path';

export function isPathInDirectory(item: {
  directoryPath: string;
  path: string;
}): boolean {
  let { directoryPath, path } = item;

  let relativePath: string = relative(directoryPath, path);

  let isInDirectory: boolean =
    relativePath.length === 0 ||
    (relativePath !== '..' &&
      !relativePath.startsWith(`..${sep}`) &&
      !isAbsolute(relativePath));

  return isInDirectory;
}
