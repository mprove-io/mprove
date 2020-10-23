import * as nodegit from 'nodegit';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { disk } from '../../barrels/disk';
import { MyRegex } from '../my-regex';
import { isRemoteBranchExist } from './is-remote-branch-exist';
import { constantFetchOptions } from './_constant-fetch-options';

export async function getRepoStatus(item: {
  projectId: string;
  repoId: string;
  projectDir: string;
  repoDir: string;
}): Promise<interfaces.ItemStatus> {
  // priorities order:
  // NeedSave (frontend only)
  // NeedStage (no need because auto add file after each save)
  // NeedResolve
  // NeedCommit
  // NeedPull
  // NeedPush
  // Ok

  let conflicts: api.DiskFileLine[] = [];

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

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

  // check conflicts manually instead of git - because they are already committed

  let itemDevRepoCatalog = <interfaces.ItemCatalog>await disk.getNodesAndFiles({
    projectId: item.projectId,
    projectDir: item.projectDir,
    repoId: item.repoId,
    readFiles: true
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

  // RETURN NeedResolve
  if (conflicts.length > 0) {
    return {
      repoStatus: api.RepoStatusEnum.NeedResolve,
      conflicts: conflicts,
      currentBranch: currentBranchName
    };
  }

  // RETURN NeedCommit
  if (patchesTreeToIndex.length > 0) {
    return {
      repoStatus: api.RepoStatusEnum.NeedCommit,
      conflicts: conflicts,
      currentBranch: currentBranchName
    };
  }

  await gitRepo.fetch('origin', constantFetchOptions);

  let isBranchExistRemote = await isRemoteBranchExist({
    repoDir: item.repoDir,
    branch: currentBranchName
  });
  // RETURN NeedPush
  if (isBranchExistRemote === false) {
    return {
      repoStatus: api.RepoStatusEnum.NeedPush,
      conflicts: conflicts,
      currentBranch: currentBranchName
    };
  }

  let localCommit = <nodegit.Commit>(
    await gitRepo.getReferenceCommit(`refs/heads/${currentBranchName}`)
  );

  let localCommitOid = localCommit.id();
  let localCommitId = localCommitOid.tostrS();

  let remoteOriginCommit = <nodegit.Commit>(
    await gitRepo.getReferenceCommit(`refs/remotes/origin/${currentBranchName}`)
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
      repoStatus: api.RepoStatusEnum.Ok,
      conflicts: conflicts,
      currentBranch: currentBranchName
    };
  }

  // RETURN NeedPull
  if (localCommitId === baseCommitId) {
    return {
      repoStatus: api.RepoStatusEnum.NeedPull,
      conflicts: conflicts,
      currentBranch: currentBranchName
    };
  }

  // RETURN NeedPush
  if (remoteOriginCommitId === baseCommitId) {
    return {
      repoStatus: api.RepoStatusEnum.NeedPush,
      conflicts: conflicts,
      currentBranch: currentBranchName
    };
  }

  // RETURN NeedPull
  // diverged
  return {
    repoStatus: api.RepoStatusEnum.NeedPull,
    conflicts: conflicts,
    currentBranch: currentBranchName
  };
}
