import { SimpleGit } from 'simple-git';

import { ErEnum } from '#common/enums/er.enum';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { DiskItemStatus } from '#common/interfaces/disk/disk-item-status';
import { ServerError } from '#common/models/server-error';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { getRepoStatus } from './get-repo-status';

export async function pushToRemote(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  branch: string;
  git: SimpleGit;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.pushToRemote',
    fn: async () => {
      let { repoStatus, currentBranch, conflicts } = <DiskItemStatus>(
        await getRepoStatus({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          git: item.git,
          isFetch: true,
          isCheckConflicts: false
        })
      );

      let okStatuses = [RepoStatusEnum.NeedPush];

      if (okStatuses.indexOf(repoStatus) < 0) {
        throw new ServerError({
          message: ErEnum.DISK_REPO_STATUS_IS_NOT_NEED_PUSH
        });
      }

      await item.git.push('origin', item.branch);
    }
  });
}
