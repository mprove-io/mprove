import { isAbsolute, relative, resolve, sep } from 'node:path';
import { SRC_PATH } from '#common/constants/top-blockml';

export function resolveTestSourceDir(item: { testsDir: string }): string {
  let { testsDir } = item;

  let sourceRoot: string = resolve(SRC_PATH);

  let compiledRoot: string = resolve('dist-test', SRC_PATH);

  let absoluteTestsDir: string = resolve(testsDir);

  let relativeTestsDir: string = relative(compiledRoot, absoluteTestsDir);

  // Compiled tests use the fixtures and copied artifacts beside their source.
  let sourceTestsDir: string =
    relativeTestsDir === '..' ||
    relativeTestsDir.startsWith(`..${sep}`) ||
    isAbsolute(relativeTestsDir)
      ? absoluteTestsDir
      : resolve(sourceRoot, relativeTestsDir);

  return sourceTestsDir;
}
