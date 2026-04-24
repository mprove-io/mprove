import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

export async function commit(item: {
  repoDir: string;
  userAlias: string;
  commitMessage: string;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.commit',
    fn: async () => {
      let git = createSimpleGit({ baseDir: item.repoDir });

      await git.addConfig('user.email', `${item.userAlias}@`);
      await git.addConfig('user.name', item.userAlias);

      await git.commit(item.commitMessage, {
        '--author': `${item.userAlias} <${item.userAlias}@>`
      });
    }
  });
}
