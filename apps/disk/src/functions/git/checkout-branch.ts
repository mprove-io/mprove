import { SimpleGit } from 'simple-git';

import { ErEnum } from '#common/enums/er.enum';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { DiskItemStatus } from '#common/interfaces/disk/disk-item-status';
import { ServerError } from '#common/models/server-error';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { getRepoStatus } from './get-repo-status';

export async function checkoutBranch(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  branchName: string;
  git: SimpleGit;
  isFetch: boolean;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.checkoutBranch',
    fn: async () => {
      let { repoStatus, currentBranch, conflicts } = <DiskItemStatus>(
        await getRepoStatus({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          git: item.git,
          isFetch: item.isFetch,
          isCheckConflicts: false
        })
      );

      if (currentBranch === item.branchName) {
        return;
      }

      let okStatuses = [
        RepoStatusEnum.NeedPush,
        RepoStatusEnum.NeedPull,
        RepoStatusEnum.Ok
      ];

      if (okStatuses.indexOf(repoStatus) < 0) {
        throw new ServerError({
          message: ErEnum.DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH,
          displayData: {
            currentBranch: currentBranch
          }
        });
      }

      await item.git.checkout(item.branchName);
    }
  });
}
