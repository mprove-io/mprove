import * as nodegit from '@figma/nodegit';
import { common } from '~disk/barrels/common';
import { nodeCommon } from '~disk/barrels/node-common';
import { ItemCatalog } from '~disk/interfaces/item-catalog';
import { ItemStatus } from '~disk/interfaces/item-status';
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
}): Promise<ItemStatus> {
  // priorities order:
  // NeedSave (frontend only)
  // NeedStage (no need because auto add file after each save)
  // NeedCommit
  // NeedPull
  // NeedPush
  // Ok

  let conflicts: common.DiskFileLine[] = [];

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let changesToCommit: common.DiskFileChange[] =
    await nodeCommon.getChangesToCommit({
      repoDir: item.repoDir,
      addContent: item.addContent
    });

  let currentBranchRef = await gitRepo.getCurrentBranch();
  let currentBranchName = await nodegit.Branch.name(currentBranchRef);

  let head: nodegit.Commit = <nodegit.Commit>await gitRepo.getHeadCommit();
  let headOid = head.id();

  //

  let changesToPush: common.DiskFileChange[] = [];

  if (changesToCommit.length === 0) {
    let ref = await nodegit.Branch.lookup(
      gitRepo,
      `origin/${currentBranchName}`,
      nodegit.Branch.BRANCH.REMOTE
    ).catch(e => {
      if (e?.message?.includes(common.NODEGIT_REMOTE_BRANCH_NOT_FOUND)) {
        return false;
      } else {
        throw e;
      }
    });

    if (common.isDefined(ref) && !!ref) {
      let theirCommit: nodegit.Commit = await gitRepo.getReferenceCommit(
        `refs/remotes/origin/${currentBranchName}`
      );

      if (common.isDefined(theirCommit)) {
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

            let fileId = common.encodeFilePath({ filePath: filePath });

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
                ? common.FileStatusEnum.New
                : x.isDeleted()
                  ? common.FileStatusEnum.Deleted
                  : x.isModified()
                    ? common.FileStatusEnum.Modified
                    : x.isTypeChange()
                      ? common.FileStatusEnum.TypeChange
                      : x.isRenamed()
                        ? common.FileStatusEnum.Renamed
                        : x.isIgnored()
                          ? common.FileStatusEnum.Ignored
                          : x.isUnmodified()
                            ? common.FileStatusEnum.Unmodified
                            : x.isCopied()
                              ? common.FileStatusEnum.Copied
                              : x.isUntracked()
                                ? common.FileStatusEnum.Untracked
                                : x.isUnreadable()
                                  ? common.FileStatusEnum.Unreadable
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
    let itemDevRepoCatalog = <ItemCatalog>await getNodesAndFiles({
      projectId: item.projectId,
      projectDir: item.projectDir,
      repoId: item.repoId,
      readFiles: true,
      isRootMproveDir: true
    });

    itemDevRepoCatalog.files.forEach(file => {
      let fileArray = file.content.split('\n');

      fileArray.forEach((s: string, ind) => {
        if (s.match(common.MyRegex.CONTAINS_CONFLICT_START())) {
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
      repoStatus: common.RepoStatusEnum.NeedCommit,
      conflicts: conflicts,
      currentBranch: currentBranchName,
      changesToCommit: changesToCommit,
      changesToPush: changesToPush
    };
  }

  if (item.isFetch === false) {
    return {
      repoStatus: common.RepoStatusEnum.Ok,
      conflicts: conflicts,
      currentBranch: currentBranchName,
      changesToCommit: changesToCommit,
      changesToPush: changesToPush
    };
  } else {
    // isRemoteBranchExist() does gitRepo.fetch()
    let isBranchExistRemote = await isRemoteBranchExist({
      repoDir: item.repoDir,
      remoteBranch: currentBranchName,
      fetchOptions: item.fetchOptions
    });
    // RETURN NeedPush
    if (isBranchExistRemote === false) {
      return {
        repoStatus: common.RepoStatusEnum.NeedPush,
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
        repoStatus: common.RepoStatusEnum.Ok,
        conflicts: conflicts,
        currentBranch: currentBranchName,
        changesToCommit: changesToCommit,
        changesToPush: changesToPush
      };
    }

    // RETURN NeedPull
    if (localCommitId === baseCommitId) {
      return {
        repoStatus: common.RepoStatusEnum.NeedPull,
        conflicts: conflicts,
        currentBranch: currentBranchName,
        changesToCommit: changesToCommit,
        changesToPush: changesToPush
      };
    }

    // RETURN NeedPush
    if (remoteOriginCommitId === baseCommitId) {
      return {
        repoStatus: common.RepoStatusEnum.NeedPush,
        conflicts: conflicts,
        currentBranch: currentBranchName,
        changesToCommit: changesToCommit,
        changesToPush: changesToPush
      };
    }

    // RETURN NeedPull
    // diverged
    return {
      repoStatus: common.RepoStatusEnum.NeedPull,
      conflicts: conflicts,
      currentBranch: currentBranchName,
      changesToCommit: changesToCommit,
      changesToPush: changesToPush
    };
  }
}
