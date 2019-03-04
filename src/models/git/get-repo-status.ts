import * as nodegit from 'nodegit';
import { api } from '../../barrels/api';
import { config } from '../../barrels/config';
import { disk } from '../../barrels/disk';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { MyRegex } from '../my-regex';
import { constantFetchOptions } from './_constant-fetch-options';

export async function getRepoStatus(item: {
  project_id: string,
  repo_id: string,
}) {

  // priorities order:

  // need_save (frontend only)
  // need_stage (no need because auto add file after each save)
  // need_resolve
  // need_commit
  // need_pull
  // need_push
  // ok

  let conflicts: api.FileLine[] = [];

  let repoPath = `${config.DISK_BASE_PATH}/${item.project_id}/${item.repo_id}`;

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoPath)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_OPEN));

  let head = <nodegit.Commit>await gitRepo.getHeadCommit()
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_GET_HEAD_COMMIT));

  let treeHead = <nodegit.Tree>await head.getTree()
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_COMMIT_GET_TREE));

  const diffTreeToIndex = <nodegit.Diff>await nodegit.Diff.treeToIndex(gitRepo, treeHead, null)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_DIFF_TREE_TO_INDEX));

  const patchesTreeToIndex = <nodegit.ConvenientPatch[]>await diffTreeToIndex.patches()
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_DIFF_PATCHES));

  // check conflicts manually instead of git - because they are already commited

  let newServerTs = helper.makeTs();

  let itemDevRepoCatalog = <interfaces.ItemCatalog>await disk.getRepoCatalogNodesAndFiles({
    project_id: item.project_id,
    repo_id: item.repo_id,
  })
    .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_GET_REPO_CATALOG_NODES_AND_FILES));

  // let {
  //   nodes: nodes,
  //   files: files } = itemDevRepoCatalog;

  itemDevRepoCatalog.files.forEach(file => {
    let fileArray = file.content.split('\n');

    fileArray.forEach((s: string, ind) => {

      if (s.match(MyRegex.CONTAINS_CONFLICT_START())) {
        conflicts.push({
          file_id: file.file_id,
          file_name: file.name,
          line_number: ind + 1
        });
      }
    });
  });

  // check conflicts using git

  // let index = await gitRepo.index();

  // if (index.hasConflicts()) {

  //   let paths: string[] = [];

  //   patchesTreeToIndex
  //     .filter(patch => patch.isConflicted())
  //     .forEach(conflictedPatch => {
  //       let newFile = conflictedPatch.newFile();
  //       let path = newFile.path();
  //       paths.push(path);
  //     });

  //   await forEach(paths, async p => {
  //     let fileAbsoluteId = repoPath + '/' + p;

  //     let file = await toDatabase(storeFiles().findOne(fileAbsoluteId));

  //     conflicts.push({
  //       file_id: file.file_id,
  //       file_name: file.name,
  //       line_number: 1
  //     });
  //   });
  // }

  if (conflicts.length > 0) {
    return { status: api.RepoStatusEnum.NeedResolve, conflicts: conflicts };
  }

  // need_stage

  // let diffIndexToWorkdir = await nodegit.Diff.indexToWorkdir(gitRepo, null, {
  //   // tslint:disable-next-line:no-bitwise
  //   flags: nodegit.Diff.OPTION.INCLUDE_UNTRACKED | nodegit.Diff.OPTION.RECURSE_UNTRACKED_DIRS
  // });
  // let patchesIndexToWorkDir = await diffIndexToWorkdir.patches();
  // if (patchesIndexToWorkDir.length > 0) {
  //   // return needStage
  // }

  if (patchesTreeToIndex.length > 0) {
    return { status: api.RepoStatusEnum.NeedCommit, conflicts: conflicts };
  }

  await gitRepo.fetch('origin', constantFetchOptions)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_FETCH));

  let localCommit = <nodegit.Commit>await gitRepo.getReferenceCommit('refs/heads/master')
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_GET_REFERENCE_COMMIT));


  let localCommitOid = localCommit.id();
  let localCommitId = localCommitOid.tostrS();

  let remoteOriginCommit = <nodegit.Commit>await gitRepo.getReferenceCommit('refs/remotes/origin/master')
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_GET_REFERENCE_COMMIT));


  let remoteOriginCommitOid = remoteOriginCommit.id();
  let remoteOriginCommitId = remoteOriginCommitOid.tostrS();

  let baseCommitOid = <nodegit.Oid>await nodegit.Merge.base(gitRepo, localCommitOid, remoteOriginCommitOid)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_MERGE_BASE));

  let baseCommitId = baseCommitOid.tostrS();

  if (localCommitId === remoteOriginCommitId) {
    return { status: api.RepoStatusEnum.Ok, conflicts: conflicts };

  } else if (localCommitId === baseCommitId) {
    return { status: api.RepoStatusEnum.NeedPull, conflicts: conflicts };

  } else if (remoteOriginCommitId === baseCommitId) {
    return { status: api.RepoStatusEnum.NeedPush, conflicts: conflicts };

  } else { // diverged
    return { status: api.RepoStatusEnum.NeedPull, conflicts: conflicts };
  }
}
