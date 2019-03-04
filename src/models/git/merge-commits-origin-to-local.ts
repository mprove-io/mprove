import * as nodegit from 'nodegit';
import { config } from '../../barrels/config';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function mergeCommitsOriginToLocal(item: {
  project_id: string,
  repo_id: string,
  user_id: string
}) {

  let repoPath = `${config.DISK_BASE_PATH}/${item.project_id}/${item.repo_id}`;

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoPath)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_OPEN));

  let remoteRef = <nodegit.Reference>await gitRepo.getReference('refs/remotes/origin/master')
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_GET_REFERENCE));

  let ourCommit = <nodegit.Commit>await gitRepo.getReferenceCommit('refs/heads/master')
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_GET_REFERENCE_COMMIT));

  let theirCommit = <nodegit.Commit>await gitRepo.getReferenceCommit('refs/remotes/origin/master')
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_GET_REFERENCE_COMMIT));

  let theirAnnotatedCommit = <nodegit.AnnotatedCommit>await nodegit.AnnotatedCommit.fromRef(gitRepo, remoteRef)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_ANNOTATED_COMMIT_FROM_REF));

  await nodegit.Merge.merge(gitRepo, theirAnnotatedCommit, null, {
    checkoutStrategy: nodegit.Checkout.STRATEGY.FORCE,
  })
    .catch((e: any) => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_MERGE_MERGE));

  let index = <nodegit.Index>await gitRepo.refreshIndex()
    .catch((e: any) => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_REFRESH_INDEX));

  if (index.hasConflicts()) {
    // merge contains conflicting changes

    // const head = await gitRepo.getHeadCommit();
    // let treeHead = await head.getTree();
    // const diffTreeToIndex = await nodegit.Diff.treeToIndex(gitRepo, treeHead, null);
    // const patchesTreeToIndex = await diffTreeToIndex.patches();

    // let paths: string[] = [];

    // patchesTreeToIndex
    //   .filter(patch => patch.isConflicted())
    //   .forEach(conflictedPatch => {
    //     let newFile = conflictedPatch.newFile();
    //     let path = newFile.path();
    //     paths.push(path);
    //   });

    // await forEach(paths, async relativePath => {
    //   await index.addByPath(relativePath);
    // });

    await <any>index.addAll(null, null)
      .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_ADD_ALL));

    await (<any>index.write()) // wrong @types - method is async
      .catch((e: any) => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_WRITE));

    await index.writeTree()
      .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_WRITE_TREE));

  } else {
    // merge is clean
  }

  let oid = <nodegit.Oid>await index.writeTreeTo(gitRepo)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_WRITE_TREE_TO));

  let author = nodegit.Signature.now('mprove user', item.user_id);
  let committer = nodegit.Signature.now('mprove server', 'support@mprove.io');

  let commitOid = <nodegit.Oid>await gitRepo.createCommit(
    'HEAD', author, committer, 'message', oid, [ourCommit, theirCommit]
  )
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_CREATE_COMMIT));

  let commit = <nodegit.Commit>await gitRepo.getCommit(commitOid)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_GET_COMMIT));

  await nodegit.Reset.reset(gitRepo, <any>commit, nodegit.Reset.TYPE.HARD, null)
    .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_RESET_RESET));
}

