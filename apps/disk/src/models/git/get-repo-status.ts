import * as nodegit from 'nodegit';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { interfaces } from '~disk/barrels/interfaces';
import { isRemoteBranchExist } from './is-remote-branch-exist';

export async function getRepoStatus(item: {
  projectId: string;
  repoId: string;
  projectDir: string;
  repoDir: string;
  fetchOptions: nodegit.FetchOptions;
  isFetch: boolean;
  isCheckConflicts: boolean;
}): Promise<interfaces.ItemStatus> {
  // priorities order:
  // NeedSave (frontend only)
  // NeedStage (no need because auto add file after each save)
  // NeedCommit
  // NeedPull
  // NeedPush
  // Ok

  let conflicts: common.DiskFileLine[] = [];

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let gitRepoStatusFiles = await gitRepo.getStatus();

  let changesToCommit: common.DiskFileChange[] = gitRepoStatusFiles.map(x => ({
    path: x.path(),
    // doesn't return booleans
    status: x.isNew()
      ? common.FileStatusEnum.New
      : x.isModified()
      ? common.FileStatusEnum.Modified
      : x.isDeleted()
      ? common.FileStatusEnum.Deleted
      : x.isTypechange()
      ? common.FileStatusEnum.TypeChange
      : x.isRenamed()
      ? common.FileStatusEnum.Renamed
      : x.isIgnored()
      ? common.FileStatusEnum.Ignored
      : undefined
  }));

  let changesToRemote: common.DiskFileChange[] = [];

  console.log(gitRepoStatusFiles);

  let currentBranchRef = await gitRepo.getCurrentBranch();
  let currentBranchName = await nodegit.Branch.name(currentBranchRef);

  let head = <nodegit.Commit>await gitRepo.getHeadCommit();

  let treeHead = <nodegit.Tree>await head.getTree();

  const diffTreeToIndex = <nodegit.Diff>(
    await nodegit.Diff.treeToIndex(gitRepo, treeHead, null)
  );

  const patchesTreeToIndex = <nodegit.ConvenientPatch[]>(
    await diffTreeToIndex.patches()
  );

  if (item.isCheckConflicts === true) {
    // check conflicts manually instead of git - because they are already committed
    let itemDevRepoCatalog = <interfaces.ItemCatalog>(
      await disk.getNodesAndFiles({
        projectId: item.projectId,
        projectDir: item.projectDir,
        repoId: item.repoId,
        readFiles: true,
        isRootMproveDir: true
      })
    );

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
      changesToRemote: changesToRemote
    };
  }

  if (item.isFetch === false) {
    return {
      repoStatus: common.RepoStatusEnum.Ok,
      conflicts: conflicts,
      currentBranch: currentBranchName,
      changesToCommit: changesToCommit,
      changesToRemote: changesToRemote
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
        changesToRemote: changesToRemote
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
        changesToRemote: changesToRemote
      };
    }

    // RETURN NeedPull
    if (localCommitId === baseCommitId) {
      return {
        repoStatus: common.RepoStatusEnum.NeedPull,
        conflicts: conflicts,
        currentBranch: currentBranchName,
        changesToCommit: changesToCommit,
        changesToRemote: changesToRemote
      };
    }

    // RETURN NeedPush
    if (remoteOriginCommitId === baseCommitId) {
      return {
        repoStatus: common.RepoStatusEnum.NeedPush,
        conflicts: conflicts,
        currentBranch: currentBranchName,
        changesToCommit: changesToCommit,
        changesToRemote: changesToRemote
      };
    }

    // RETURN NeedPull
    // diverged
    return {
      repoStatus: common.RepoStatusEnum.NeedPull,
      conflicts: conflicts,
      currentBranch: currentBranchName,
      changesToCommit: changesToCommit,
      changesToRemote: changesToRemote
    };
  }
}
