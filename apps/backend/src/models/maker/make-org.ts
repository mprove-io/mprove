import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeOrg(item: {
  orgId?: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
}) {
  let orgEntity: entities.OrgEntity = {
    org_id: item.orgId || common.makeId(),
    name: item.name,
    owner_id: item.ownerId,
    owner_email: item.ownerEmail,
    server_ts: undefined
  };
  return orgEntity;
}
