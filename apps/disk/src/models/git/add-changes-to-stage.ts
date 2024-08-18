import * as nodegit from '@figma/nodegit';

export async function addChangesToStage(item: { repoDir: string }) {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let index = <nodegit.Index>await gitRepo.index();

  await index.addAll(null, null);

  await index.write(); // wrong @types - method is async

  await index.writeTree();
}
