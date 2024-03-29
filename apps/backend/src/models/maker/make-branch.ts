import { entities } from '~backend/barrels/entities';

export function makeBranch(item: {
  projectId: string;
  repoId: string;
  branchId: string;
}) {
  let branchEntity: entities.BranchEntity = {
    project_id: item.projectId,
    repo_id: item.repoId,
    branch_id: item.branchId,
    server_ts: undefined
  };
  return branchEntity;
}
