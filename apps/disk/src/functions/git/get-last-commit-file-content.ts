import * as nodegit from '@figma/nodegit';
import { NODEGIT_PATH_NOT_EXIST_IN_TREE } from '~common/constants/top';
import { isDefined } from '~common/functions/is-defined';

export async function getLastCommitFileContent(item: {
  repoDir: string;
  filePathRelative: string;
}): Promise<string> {
  let originalContent = '';

  let gitRepo: nodegit.Repository = await nodegit.Repository.open(item.repoDir);
  let head: nodegit.Commit = await gitRepo.getHeadCommit();
  let tree: nodegit.Tree = await head.getTree();

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

  return originalContent;
}
