import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { BRANCH_MAIN } from '#common/constants/top';
import { SEED_PROJECTS } from '#common/constants/top-disk';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { createSimpleGit } from '#node-common/functions/create-simple-git';
import type { DiskFileIsSymlinkError } from '../disk/errors/disk-file-is-symlink-error';
import { prepareInitialProjectFiles } from './prepare-initial-project-files';

export function createInitialCommitToProd(item: {
  prodDir: string;
  projectId: string;
  seedProjectId: string;
  projectName: string;
  userAlias: string;
}): Result.ResultAsync<void, DiskFileIsSymlinkError> {
  return addTraceSpan({
    spanName: 'disk.git.createInitialCommitToProd',
    fn: () =>
      Result.pipe(
        Result.succeed({
          ...item,
          git: createSimpleGit({ baseDir: item.prodDir }),
          sourceDir: `${SEED_PROJECTS}/${item.seedProjectId}`
        }),
        Result.andThrough(v =>
          prepareInitialProjectFiles({
            prodDir: v.prodDir,
            sourceDir: v.sourceDir,
            seedProjectId: v.seedProjectId,
            projectName: v.projectName
          })
        ),
        Result.andThen(async v => {
          let git: SimpleGit = v.git;

          await git.add('.');

          await git.addConfig('user.email', `${v.userAlias}@`);

          await git.addConfig('user.name', v.userAlias);

          let message = 'init';

          await git.commit(message, {
            '--author': `${v.userAlias} <${v.userAlias}@>`
          });

          await git.branch(['-M', BRANCH_MAIN]);

          return Result.succeed();
        })
      )
  });
}
