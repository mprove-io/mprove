import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeOrg(item: {
  organizationId?: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
}) {
  let orgEntity: entities.OrgEntity = {
    organization_id: item.organizationId || common.makeId(),
    name: item.name,
    owner_id: item.ownerId,
    owner_email: item.ownerEmail,
    server_ts: undefined
  };
  return orgEntity;
}
