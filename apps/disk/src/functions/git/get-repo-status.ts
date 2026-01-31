import { SimpleGit } from 'simple-git';
import { FileStatusEnum } from '#common/enums/file-status.enum';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { DiskFileChange } from '#common/interfaces/disk/disk-file-change';
import { DiskFileLine } from '#common/interfaces/disk/disk-file-line';
import { DiskItemCatalog } from '#common/interfaces/disk/disk-item-catalog';
import { DiskItemStatus } from '#common/interfaces/disk/disk-item-status';
import { MyRegex } from '#common/models/my-regex';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { getChangesToCommit } from '#node-common/functions/get-changes-to-commit';
import { getNodesAndFiles } from '../disk/get-nodes-and-files';
import { isRemoteBranchExist } from './is-remote-branch-exist';

export async function getRepoStatus(item: {
  projectId: string;
  repoId: string;
  projectDir: string;
  repoDir: string;
  git: SimpleGit;
  isFetch: boolean;
  isCheckConflicts: boolean;
  addContent?: boolean;
}): Promise<DiskItemStatus> {
  return await addTraceSpan({
    spanName: 'disk.git.getRepoStatus',
    fn: async () => {
      // priorities order:
      // NeedSave (frontend only)
      // NeedStage (no need because auto add file after each save)
      // NeedCommit
      // NeedPull
      // NeedPush
      // Ok

      let conflicts: DiskFileLine[] = [];

      let git = item.git;

      let changesToCommit: DiskFileChange[] = await getChangesToCommit({
        repoDir: item.repoDir,
        addContent: item.addContent
      });

      let branchSummary = await git.branch();
      let currentBranchName = branchSummary.current;

      let logResult = await git.log(['-1']);
      let headCommitSha = logResult.latest?.hash;

      //

      let changesToPush: DiskFileChange[] = [];

      if (changesToCommit.length === 0) {
        let remoteBranches = await git.branch(['-r']);
        let remoteBranchExists = remoteBranches.all.includes(
          `origin/${currentBranchName}`
        );

        if (remoteBranchExists) {
          let remoteCommitSha = await git.revparse([
            `origin/${currentBranchName}`
          ]);

          try {
            let mergeBaseResult = await git.raw([
              'merge-base',
              headCommitSha,
              remoteCommitSha.trim()
            ]);
            let commonAncestorSha = mergeBaseResult.trim();

            if (commonAncestorSha !== headCommitSha) {
              let diffSummary = await git.diffSummary([
                commonAncestorSha,
                headCommitSha
              ]);

              changesToPush = diffSummary.files.map(file => {
                let filePath = file.file;
                let filePathArray = filePath.split('/');

                let fileId = encodeFilePath({ filePath: filePath });

                let fileName = filePathArray.slice(-1)[0];

                let fileParentPath =
                  filePathArray.length === 1
                    ? ''
                    : filePathArray.slice(0, -1).join('/');

                let status: FileStatusEnum;
                if (
                  (file as any).insertions > 0 &&
                  (file as any).deletions === 0 &&
                  (file as any).binary === false
                ) {
                  status = FileStatusEnum.New;
                } else if (
                  (file as any).insertions === 0 &&
                  (file as any).deletions > 0
                ) {
                  status = FileStatusEnum.Deleted;
                } else {
                  status = FileStatusEnum.Modified;
                }

                return {
                  fileName: fileName,
                  fileId: fileId,
                  parentPath: fileParentPath,
                  status: status
                };
              });
            }
          } catch (e) {
            // merge-base can fail if commits have no common ancestor
          }
        }
      }
      //

      // Use git diff --cached to detect ALL staged changes including deletions
      // (statusResult.staged doesn't reliably include staged deletions)
      let stagedDiff = await git.diffSummary(['--cached']);
      let stagedFilesCount = stagedDiff.files.length;

      if (item.isCheckConflicts === true) {
        // check conflicts manually instead of git - because they are already committed
        let itemDevRepoCatalog = <DiskItemCatalog>await getNodesAndFiles({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          readFiles: true,
          isRootMproveDir: true
        });

        itemDevRepoCatalog.files.forEach(file => {
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
      }

      // RETURN NeedCommit
      if (stagedFilesCount > 0) {
        return {
          repoStatus: RepoStatusEnum.NeedCommit,
          conflicts: conflicts,
          currentBranch: currentBranchName,
          changesToCommit: changesToCommit,
          changesToPush: changesToPush
        };
      }

      let isBranchExistRemote = await isRemoteBranchExist({
        repoDir: item.repoDir,
        remoteBranch: currentBranchName,
        git: git,
        isFetch: item.isFetch
      });

      // RETURN NeedPush
      if (isBranchExistRemote === false) {
        return {
          repoStatus: RepoStatusEnum.NeedPush,
          conflicts: conflicts,
          currentBranch: currentBranchName,
          changesToCommit: changesToCommit,
          changesToPush: changesToPush
        };
      }

      let localCommitId = await git.revparse([
        `refs/heads/${currentBranchName}`
      ]);
      localCommitId = localCommitId.trim();

      let remoteOriginCommitId = await git.revparse([
        `refs/remotes/origin/${currentBranchName}`
      ]);
      remoteOriginCommitId = remoteOriginCommitId.trim();

      //
      let baseCommitResult = await git.raw([
        'merge-base',
        localCommitId,
        remoteOriginCommitId
      ]);
      let baseCommitId = baseCommitResult.trim();

      // RETURN Ok
      if (localCommitId === remoteOriginCommitId) {
        return {
          repoStatus: RepoStatusEnum.Ok,
          conflicts: conflicts,
          currentBranch: currentBranchName,
          changesToCommit: changesToCommit,
          changesToPush: changesToPush
        };
      }

      // RETURN NeedPull
      if (localCommitId === baseCommitId) {
        return {
          repoStatus: RepoStatusEnum.NeedPull,
          conflicts: conflicts,
          currentBranch: currentBranchName,
          changesToCommit: changesToCommit,
          changesToPush: changesToPush
        };
      }

      // RETURN NeedPush
      if (remoteOriginCommitId === baseCommitId) {
        return {
          repoStatus: RepoStatusEnum.NeedPush,
          conflicts: conflicts,
          currentBranch: currentBranchName,
          changesToCommit: changesToCommit,
          changesToPush: changesToPush
        };
      }

      // RETURN NeedPull
      // diverged
      return {
        repoStatus: RepoStatusEnum.NeedPull,
        conflicts: conflicts,
        currentBranch: currentBranchName,
        changesToCommit: changesToCommit,
        changesToPush: changesToPush
      };
    }
  });
}
