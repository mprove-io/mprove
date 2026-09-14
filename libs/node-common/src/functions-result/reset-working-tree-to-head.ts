import path from 'node:path';
import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import pIteration from 'p-iteration';
import type { StatusResult } from 'simple-git';
import type { DiskPathTraversalError } from '#common/zod/disk/errors/disk-path-traversal-error';
import { createSimpleGit } from '../functions/create-simple-git';
import { validatePathUnderDir } from './validate-path-under-dir';

const { forEachSeries } = pIteration;

export function resetWorkingTreeToHead(item: {
  repoDir: string;
  statusResult?: StatusResult;
}): Result.ResultAsync<void, DiskPathTraversalError> {
  let { repoDir, statusResult } = item;

  return Result.try({
    try: async (): Promise<void> => {
      let git = createSimpleGit({ baseDir: repoDir });

      let status: StatusResult = statusResult ?? (await git.status());
      let untrackedPaths: string[] = [...status.not_added].sort((a, b) =>
        a.localeCompare(b)
      );

      await git.reset(['--hard', 'HEAD']);

      await forEachSeries(untrackedPaths, async (untrackedPath: string) => {
        let filePath: string = Result.unwrap(
          validatePathUnderDir({
            fullPath: path.resolve(repoDir, untrackedPath),
            allowedDir: repoDir,
            displayPath: untrackedPath
          })
        );

        await fse.remove(filePath);
      });
    },
    catch: (error: unknown): DiskPathTraversalError => {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'DISK_PATH_TRAVERSAL'
      ) {
        return error as DiskPathTraversalError;
      }

      throw error;
    }
  });
}
