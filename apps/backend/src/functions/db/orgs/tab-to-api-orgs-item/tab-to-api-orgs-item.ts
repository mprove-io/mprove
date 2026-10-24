import type { OrgTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { OrgsItem } from '#common/types/backend/parts/orgs-item';

export function tabToApiOrgsItem(item: { org: OrgTab }): OrgsItem {
  let { org } = item;

  let apiOrgsItem: OrgsItem = {
    orgId: org.orgId,
    name: org.name
  };

  return apiOrgsItem;
}
