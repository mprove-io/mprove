import path from 'node:path';
import { Result } from '@praha/byethrow';
import type { SimpleGit, StatusResult } from 'simple-git';
import type { DiskPathTraversalError } from '#common/zod/disk/errors/disk-path-traversal-error';
import { createSimpleGit } from '../functions/create-simple-git';
import { removePathUnderDir } from './remove-path-under-dir';

export function resetWorkingTreeToHead(item: {
  repoDir: string;
  statusResult?: StatusResult;
}): Result.ResultAsync<void, DiskPathTraversalError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('git', async v => {
      let git: SimpleGit = createSimpleGit({ baseDir: v.repoDir });
      return Result.succeed(git);
    }),
    Result.bind('status', async v => {
      let status: StatusResult = v.statusResult ?? (await v.git.status());
      return Result.succeed(status);
    }),
    Result.bind('untrackedPaths', v => {
      let untrackedPaths: string[] = [...v.status.not_added].sort((a, b) =>
        a.localeCompare(b)
      );
      return Result.succeed(untrackedPaths);
    }),
    Result.andThrough(async v => {
      await v.git.reset(['--hard', 'HEAD']);
      return Result.succeed();
    }),
    Result.andThen(v =>
      Result.sequence(v.untrackedPaths, (untrackedPath: string) =>
        removePathUnderDir({
          fullPath: path.resolve(v.repoDir, untrackedPath),
          allowedDir: v.repoDir,
          displayPath: untrackedPath
        })
      )
    ),
    Result.map((): void => undefined)
  );
}
