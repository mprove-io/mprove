import * as nodegit from 'nodegit';

export async function commit(item: {
  repoDir: string;
  userAlias: string;
  commitMessage: string;
}) {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let index = <nodegit.Index>await gitRepo.index();

  let oid = <nodegit.Oid>await index.writeTree();

  let head = <nodegit.Oid>await nodegit.Reference.nameToId(gitRepo, 'HEAD');

  let parent = <nodegit.Commit>await gitRepo.getCommit(head);

  let author = nodegit.Signature.now(item.userAlias, `${item.userAlias}@`);
  let committer = nodegit.Signature.now(item.userAlias, `${item.userAlias}@`);

  await gitRepo.createCommit(
    'HEAD',
    author,
    committer,
    item.commitMessage,
    oid,
    [parent]
  );
}
