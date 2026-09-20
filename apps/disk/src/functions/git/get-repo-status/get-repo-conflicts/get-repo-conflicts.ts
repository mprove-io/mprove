import { Result } from '@praha/byethrow';
import { MyRegex } from '#common/classes/my-regex';
import type { DiskFileLine } from '#common/zod/disk/disk-file-line';
import type { DiskGetRepoConflictsError } from '#common/zod/disk/function-errors/disk-get-repo-conflicts-error';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';

export function getRepoConflicts(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  isCheckConflicts: boolean;
}): Result.ResultMaybeAsync<DiskFileLine[], DiskGetRepoConflictsError> {
  let conflicts: DiskFileLine[] = [];

  if (item.isCheckConflicts === true) {
    // Check conflicts manually instead of git because they are already committed.
    return Result.pipe(
      Result.succeed({ ...item }),
      Result.bind('itemDevRepoCatalog', v =>
        getNodesAndFiles({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.repoId,
          readFiles: true,
          isRootMproveDir: true
        })
      ),
      Result.map(v => {
        v.itemDevRepoCatalog.files.forEach(file => {
          let fileArray = file.content.split('\n');

          fileArray.forEach((s: string, ind) => {
            if (s.match(MyRegex.CONTAINS_CONFLICT_START())) {
              conflicts.push({
                fileId: file.fileId,
                fileName: file.name,
                lineNumber: ind + 1
              });
            }
          });
        });

        return conflicts;
      })
    );
  }

  return Result.succeed(conflicts);
}
