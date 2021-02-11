import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeOrg(item: { organizationId?: string; name: string }) {
  let orgEntity: entities.OrgEntity = {
    organization_id: item.organizationId || common.makeId(),
    name: item.name,
    server_ts: undefined
  };
  return orgEntity;
}
