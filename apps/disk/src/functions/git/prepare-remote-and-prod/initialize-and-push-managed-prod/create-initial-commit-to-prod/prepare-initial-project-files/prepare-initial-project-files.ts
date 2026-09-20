import { Result } from '@praha/byethrow';
import { isDefined } from '#common/functions/is-defined';
import type { DiskPrepareInitialProjectFilesError } from '#common/zod/disk/function-errors/disk-prepare-initial-project-files-error';
import { copyPath } from '#disk/functions/disk/copy-path/copy-path';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { writeDefaultInitialProjectFiles } from '#disk/functions/git/prepare-remote-and-prod/initialize-and-push-managed-prod/create-initial-commit-to-prod/prepare-initial-project-files/write-default-initial-project-files/write-default-initial-project-files';

export function prepareInitialProjectFiles(item: {
  prodDir: string;
  sourceDir: string;
  seedProjectId: string;
  projectName: string;
}): Result.ResultAsync<void, DiskPrepareInitialProjectFilesError> {
  return Result.pipe(
    Result.succeed({ ...item }),
    Result.bind('isSourceExist', v => isPathExist({ path: v.sourceDir })),
    Result.andThen(v =>
      isDefined(v.seedProjectId) && v.isSourceExist === true
        ? copyPath({
            sourcePath: v.sourceDir,
            destinationPath: v.prodDir
          })
        : writeDefaultInitialProjectFiles({
            prodDir: v.prodDir,
            projectName: v.projectName
          })
    )
  );
}
