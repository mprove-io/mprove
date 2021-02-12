import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';

export function wrapToApiOrg(org: entities.OrgEntity): apiToBackend.Org {
  return {
    orgId: org.org_id,
    name: org.name,
    serverTs: Number(org.server_ts)
  };
}
