import * as nodegit from '@figma/nodegit';
import {
  NODEGIT_PATH_NOT_EXIST_IN_TREE,
  NODEGIT_REMOTE_BRANCH_NOT_FOUND
} from '~common/constants/top';
import { isDefined } from '~common/functions/is-defined';

export async function getBaseCommitFileContent(item: {
  repoDir: string;
  filePathRelative: string;
}): Promise<string> {
  let originalContent = '';

  let gitRepo: nodegit.Repository = await nodegit.Repository.open(item.repoDir);

  let currentBranchRef = await gitRepo.getCurrentBranch();
  let currentBranchName = await nodegit.Branch.name(currentBranchRef);

  let head: nodegit.Commit = await gitRepo.getHeadCommit();
  let headOid = head.id();

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

      let baseCommit = await gitRepo.getCommit(commonAncestorOid);

      let tree: nodegit.Tree = await baseCommit.getTree();

      let entry: nodegit.TreeEntry = await tree
        .getEntry(item.filePathRelative)
        .catch((e): any => {
          if (e?.message?.includes(NODEGIT_PATH_NOT_EXIST_IN_TREE)) {
            return undefined;
          } else {
            throw e;
          }
        });

      if (isDefined(entry) && entry.isBlob()) {
        let blob: nodegit.Blob = await entry.getBlob();

        originalContent = blob.toString();
      }
    }
  }

  return originalContent;
}
