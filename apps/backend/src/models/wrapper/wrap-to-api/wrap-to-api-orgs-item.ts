import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiOrgsItem(org: entities.OrgEntity): common.OrgsItem {
  return {
    orgId: org.org_id,
    name: org.name
  };
}
