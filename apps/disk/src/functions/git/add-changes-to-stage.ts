import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

export async function addChangesToStage(item: { repoDir: string }) {
  return await addTraceSpan({
    spanName: 'disk.git.addChangesToStage',
    fn: async () => {
      let git = createSimpleGit({ baseDir: item.repoDir });

      await git.add(['-A']);
    }
  });
}
