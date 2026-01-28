import * as nodegit from 'nodegit';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function deleteLocalBranch(item: {
  repoDir: string;
  branch: string;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.deleteLocalBranch',
    fn: async () => {
      let gitRepo = <nodegit.Repository>(
        await nodegit.Repository.open(item.repoDir)
      );

      let branchRef = await nodegit.Branch.lookup(
        gitRepo,
        item.branch,
        nodegit.Branch.BRANCH.LOCAL
      );

      await nodegit.Branch.delete(branchRef); // await
    }
  });
}
