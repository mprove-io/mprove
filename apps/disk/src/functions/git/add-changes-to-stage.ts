import { simpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function addChangesToStage(item: { repoDir: string }) {
  return await addTraceSpan({
    spanName: 'disk.git.addChangesToStage',
    fn: async () => {
      let git = simpleGit({ baseDir: item.repoDir });

      await git.add(['-A']);
    }
  });
}
