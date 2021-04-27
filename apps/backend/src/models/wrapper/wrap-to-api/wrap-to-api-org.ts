import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiOrg(org: entities.OrgEntity): common.Org {
  return {
    orgId: org.org_id,
    name: org.name,
    ownerEmail: org.owner_email,
    ownerId: org.owner_id,
    companySize: org.company_size,
    contactPhone: org.contact_phone,
    serverTs: Number(org.server_ts)
  };
}
