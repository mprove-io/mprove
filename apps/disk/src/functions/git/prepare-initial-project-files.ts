import { Result } from '@praha/byethrow';
import { isDefined } from '#common/functions/is-defined';
import { copyPath } from '../disk/copy-path';
import type { DiskFileIsSymlinkError } from '../disk/errors/disk-file-is-symlink-error';
import { isPathExist } from '../disk/is-path-exist';
import { writeDefaultInitialProjectFiles } from './write-default-initial-project-files';

export function prepareInitialProjectFiles(item: {
  prodDir: string;
  sourceDir: string;
  seedProjectId: string;
  projectName: string;
}): Result.ResultAsync<void, DiskFileIsSymlinkError> {
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
