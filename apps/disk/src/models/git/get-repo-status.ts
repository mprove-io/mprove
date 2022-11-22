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

  let changesToCommit: common.DiskFileChange[] = gitRepoStatusFiles.map(x => {
    let path = x.path();
    let pathArray = path.split('/');

    let fileId = pathArray.join(common.TRIPLE_UNDERSCORE);

    let fileName = pathArray.slice(-1)[0];

    let parentPath =
      pathArray.length === 1 ? '' : pathArray.slice(0, -1).join('/');

    return {
      fileName: fileName,
      fileId: fileId,
      parentPath: parentPath,
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
    };
  });

  // console.log(gitRepoStatusFiles);

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
      if (e?.message?.includes('cannot locate remote-tracking branch')) {
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
          const fromTree = await head.getTree();

          const to = await gitRepo.getCommit(commonAncestorOid);
          const toTree = await to.getTree();

          const diff = await toTree.diff(fromTree);
          const patches = await diff.patches();

          changesToPush = patches.map((x: nodegit.ConvenientPatch) => {
            let newFile = x.newFile();

            let newFilePath = newFile.path();
            let newFilePathArray = newFilePath.split('/');

            let newFileId = newFilePathArray.join(common.TRIPLE_UNDERSCORE);

            let newFileName = newFilePathArray.slice(-1)[0];

            let newFileParentPath =
              newFilePathArray.length === 1
                ? ''
                : newFilePathArray.slice(0, -1).join('/');

            return {
              fileName: newFileName,
              fileId: newFileId,
              parentPath: newFileParentPath,
              status: undefined
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
