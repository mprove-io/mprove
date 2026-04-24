import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

export async function getLastCommitFileContent(item: {
  repoDir: string;
  filePathRelative: string;
}): Promise<string> {
  return await addTraceSpan({
    spanName: 'disk.git.getLastCommitFileContent',
    fn: async () => {
      let git = createSimpleGit({ baseDir: item.repoDir });

      try {
        let content = await git.show([`HEAD:${item.filePathRelative}`]);
        return content;
      } catch (e: any) {
        if (
          e?.message?.includes('does not exist') ||
          e?.message?.includes('path') ||
          e?.message?.includes('exists on disk, but not in')
        ) {
          return '';
        }
        throw e;
      }
    }
  });
}
