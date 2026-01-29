import nodegit from 'nodegit';
import { NODEGIT_REMOTE_BRANCH_NOT_FOUND } from '#common/constants/top';
import { FileStatusEnum } from '#common/enums/file-status.enum';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { isDefined } from '#common/functions/is-defined';
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
  fetchOptions: nodegit.FetchOptions;
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

      let gitRepo = <nodegit.Repository>(
        await nodegit.Repository.open(item.repoDir)
      );

      let changesToCommit: DiskFileChange[] = await getChangesToCommit({
        repoDir: item.repoDir,
        addContent: item.addContent
      });

      let currentBranchRef = await gitRepo.getCurrentBranch();
      let currentBranchName = await nodegit.Branch.name(currentBranchRef);

      let head: nodegit.Commit = <nodegit.Commit>await gitRepo.getHeadCommit();
      let headOid = head.id();

      //

      let changesToPush: DiskFileChange[] = [];

      if (changesToCommit.length === 0) {
        let ref = await nodegit.Branch.lookup(
          gitRepo,
          `origin/${currentBranchName}`,
          nodegit.Branch.BRANCH.REMOTE
        ).catch(e => {
          if (e?.message?.includes(NODEGIT_REMOTE_BRANCH_NOT_FOUND)) {
            return false;
          } else {
            throw e;
          }
        });

        if (isDefined(ref) && !!ref) {
          let theirCommit: nodegit.Commit = await gitRepo.getReferenceCommit(
            `refs/remotes/origin/${currentBranchName}`
          );

          if (isDefined(theirCommit)) {
            let theirCommitOid = theirCommit.id();

            let commonAncestorOid: nodegit.Oid = await nodegit.Merge.base(
              gitRepo,
              headOid,
              theirCommitOid
            );

            if (commonAncestorOid !== headOid) {
              const headTree = await head.getTree();

              const baseCommit = await gitRepo.getCommit(commonAncestorOid);
              const baseTree = await baseCommit.getTree();

              const diff = await headTree.diff(baseTree);
              const patches = await diff.patches();

              changesToPush = patches.map((x: nodegit.ConvenientPatch) => {
                let file = x.newFile();

                let filePath = file.path();
                let filePathArray = filePath.split('/');

                let fileId = encodeFilePath({ filePath: filePath });

                let fileName = filePathArray.slice(-1)[0];

                let fileParentPath =
                  filePathArray.length === 1
                    ? ''
                    : filePathArray.slice(0, -1).join('/');

                return {
                  fileName: fileName,
                  fileId: fileId,
                  parentPath: fileParentPath,
                  status: x.isAdded()
                    ? FileStatusEnum.New
                    : x.isDeleted()
                      ? FileStatusEnum.Deleted
                      : x.isModified()
                        ? FileStatusEnum.Modified
                        : x.isTypeChange()
                          ? FileStatusEnum.TypeChange
                          : x.isRenamed()
                            ? FileStatusEnum.Renamed
                            : x.isIgnored()
                              ? FileStatusEnum.Ignored
                              : x.isUnmodified()
                                ? FileStatusEnum.Unmodified
                                : x.isCopied()
                                  ? FileStatusEnum.Copied
                                  : x.isUntracked()
                                    ? FileStatusEnum.Untracked
                                    : x.isUnreadable()
                                      ? FileStatusEnum.Unreadable
                                      : undefined
                };
              });
            }
          }
        }
      }
      //

      let treeHead = <nodegit.Tree>await head.getTree();

      const diffTreeToIndex = <nodegit.Diff>(
        await nodegit.Diff.treeToIndex(gitRepo, treeHead, null)
      );

      const patchesTreeToIndex = <nodegit.ConvenientPatch[]>(
        await diffTreeToIndex.patches()
      );

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
      if (patchesTreeToIndex.length > 0) {
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
        fetchOptions: item.fetchOptions,
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

      let localCommit = <nodegit.Commit>(
        await gitRepo.getReferenceCommit(`refs/heads/${currentBranchName}`)
      );

      let localCommitOid = localCommit.id();
      let localCommitId = localCommitOid.tostrS();

      let remoteOriginCommit = <nodegit.Commit>(
        await gitRepo.getReferenceCommit(
          `refs/remotes/origin/${currentBranchName}`
        )
      );

      let remoteOriginCommitOid = remoteOriginCommit.id();
      let remoteOriginCommitId = remoteOriginCommitOid.tostrS();

      //
      let baseCommitOid = <nodegit.Oid>(
        await nodegit.Merge.base(gitRepo, localCommitOid, remoteOriginCommitOid)
      );
      let baseCommitId = baseCommitOid.tostrS();

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
