import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeProject(item: {
  orgId: string;
  projectId: string;
  name: string;
  defaultBranch: string;
  gitUrl: string;
  remoteType: common.ProjectRemoteTypeEnum;
  privateKey: string;
  publicKey: string;
}) {
  let projectEntity: entities.ProjectEntity = {
    org_id: item.orgId,
    project_id: item.projectId,
    name: item.name,
    default_branch: item.defaultBranch,
    remote_type: item.remoteType,
    git_url: item.gitUrl,
    private_key: item.privateKey,
    public_key: item.publicKey,
    server_ts: undefined
  };
  return projectEntity;
}
