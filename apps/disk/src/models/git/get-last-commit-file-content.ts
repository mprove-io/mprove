import * as nodegit from 'nodegit';
import { common } from '~disk/barrels/common';

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
    .catch(e => {
      if (e?.message?.includes(common.NODEGIT_PATH_NOT_EXIST_IN_TREE)) {
        return undefined;
      } else {
        throw e;
      }
    });

  if (common.isDefined(entry) && entry.isBlob()) {
    let blob: nodegit.Blob = await entry.getBlob();

    originalContent = blob.toString();
  }

  return originalContent;
}
