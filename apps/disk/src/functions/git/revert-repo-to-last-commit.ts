import * as nodegit from 'nodegit';
import { addTraceSpan } from '~node-common/functions/add-trace-span';

export async function revertRepoToLastCommit(item: { repoDir: string }) {
  return await addTraceSpan({
    spanName: 'disk.git.revertRepoToLastCommit',
    fn: async () => {
      let gitRepo: nodegit.Repository = await nodegit.Repository.open(
        item.repoDir
      );

      let headCommit: nodegit.Commit = await gitRepo.getHeadCommit();

      await nodegit.Reset.reset(
        gitRepo,
        headCommit,
        nodegit.Reset.TYPE.HARD,
        null
      );
    }
  });
}
