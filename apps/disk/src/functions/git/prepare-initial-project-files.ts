import { Result } from '@praha/byethrow';
import { isDefined } from '#common/functions/is-defined';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import { copyPath } from '../disk/copy-path';
import { isPathExist } from '../disk/is-path-exist';
import { writeDefaultInitialProjectFiles } from './write-default-initial-project-files';

export function prepareInitialProjectFiles(item: {
  prodDir: string;
  sourceDir: string;
  seedProjectId: string;
  projectName: string;
}): Result.ResultAsync<void, FileIsSymlinkError> {
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
