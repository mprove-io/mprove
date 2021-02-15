import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiOrg(org: entities.OrgEntity): common.Org {
  return {
    orgId: org.org_id,
    name: org.name,
    serverTs: Number(org.server_ts)
  };
}
