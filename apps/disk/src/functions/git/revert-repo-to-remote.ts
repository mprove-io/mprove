import * as nodegit from 'nodegit';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function revertRepoToRemote(item: {
  repoDir: string;
  remoteBranch: string;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.revertRepoToRemote',
    fn: async () => {
      let gitRepo = <nodegit.Repository>(
        await nodegit.Repository.open(item.repoDir)
      );

      let theirCommit: nodegit.Commit = await gitRepo.getReferenceCommit(
        `refs/remotes/origin/${item.remoteBranch}`
      );

      await nodegit.Reset.reset(
        gitRepo,
        theirCommit,
        nodegit.Reset.TYPE.HARD,
        null
      );
    }
  });
}
