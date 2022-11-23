import * as nodegit from 'nodegit';

export async function getLastCommitFileContent(item: {
  repoDir: string;
  filePathRelative: string;
}): Promise<string> {
  let originalContent = '';

  let gitRepo: nodegit.Repository = await nodegit.Repository.open(item.repoDir);

  let head: nodegit.Commit = await gitRepo.getHeadCommit();

  let headTree: nodegit.Tree = await head.getTree();

  let headTreeEntry: nodegit.TreeEntry = await headTree.getEntry(
    item.filePathRelative
  );

  let headTreeEntryBlob = await headTreeEntry.getBlob();

  originalContent = headTreeEntryBlob.toString();

  return originalContent;
}
