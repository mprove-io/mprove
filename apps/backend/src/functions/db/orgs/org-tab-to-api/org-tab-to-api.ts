import type { OrgTab } from '#backend/drizzle/postgres/tables/orgs';
import type { Org } from '#common/types/backend/parts/org';

export function orgTabToApi(item: { org: OrgTab }): Org {
  let { org } = item;

  let apiOrg: Org = {
    orgId: org.orgId,
    ownerId: org.ownerId,
    name: org.name,
    ownerEmail: org.ownerEmail,
    serverTs: Number(org.serverTs)
  };

  return apiOrg;
}
