import * as nodegit from '@figma/nodegit';
import { addTraceSpan } from '~node-common/functions/add-trace-span';

export async function createBranch(item: {
  repoDir: string;
  fromBranch: string;
  newBranch: string;
  fetchOptions: nodegit.FetchOptions;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.createBranch',
    fn: async () => {
      let gitRepo = <nodegit.Repository>(
        await nodegit.Repository.open(item.repoDir)
      );

      await addTraceSpan({
        spanName: 'disk.git.createBranch.gitRepo.fetch',
        fn: () => gitRepo.fetch('origin', item.fetchOptions)
      });

      let commit = <nodegit.Commit>(
        await gitRepo.getBranchCommit(item.fromBranch)
      );

      // do not overwrite existing branch
      let force = 0;

      await nodegit.Branch.create(gitRepo, item.newBranch, commit, force);
    }
  });
}
