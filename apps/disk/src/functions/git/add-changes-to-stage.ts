import * as nodegit from 'nodegit';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function addChangesToStage(item: { repoDir: string }) {
  return await addTraceSpan({
    spanName: 'disk.git.addChangesToStage',
    fn: async () => {
      let gitRepo = <nodegit.Repository>(
        await nodegit.Repository.open(item.repoDir)
      );

      let index = <nodegit.Index>await gitRepo.index();

      await index.addAll(null, null);

      await index.write(); // wrong @types - method is async

      await index.writeTree();
    }
  });
}
