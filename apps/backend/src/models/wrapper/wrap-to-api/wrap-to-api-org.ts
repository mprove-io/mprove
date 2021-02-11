import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';

export function wrapToApiOrg(
  org: entities.OrgEntity
): apiToBackend.Organization {
  return {
    organizationId: org.organization_id,
    name: org.name,
    serverTs: Number(org.server_ts)
  };
}
