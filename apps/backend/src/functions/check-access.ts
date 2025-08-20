import { ChartEnt } from '~backend/drizzle/postgres/schema/charts';
import { DashboardEnt } from '~backend/drizzle/postgres/schema/dashboards';
import { MemberEnt } from '~backend/drizzle/postgres/schema/members';
import { ModelEnt } from '~backend/drizzle/postgres/schema/models';
import { ReportEnt } from '~backend/drizzle/postgres/schema/reports';
import { isDefined } from '~common/functions/is-defined';

export function checkAccess(item: {
  userAlias: string;
  member: MemberEnt;
  entity: ChartEnt | ModelEnt | DashboardEnt | ReportEnt;
}): boolean {
  let { userAlias, member, entity } = item;

  // TODO: remove and use the same logic for dashboard and report as for edit draft chart
  if (
    (entity as ChartEnt | DashboardEnt | ReportEnt).draft === true &&
    member.memberId !==
      (entity as ChartEnt | DashboardEnt | ReportEnt).creatorId
  ) {
    return false;
  }

  if (
    isDefined((entity as ModelEnt).connectionId) && // only models have connection_id
    member.isExplorer === false
  ) {
    return false;
  }

  if (member.isAdmin === true || member.isEditor === true) {
    return true;
  }

  if (entity.accessRoles.length === 0) {
    return true;
  }

  if (!entity.accessRoles.some(x => member.roles.includes(x))) {
    return false;
  }

  return true;
}
