import { MemberEnx } from '~backend/drizzle/postgres/schema/members';

export function checkAccess(item: {
  member: MemberEnx;
  accessRoles: string[];
}): boolean {
  let { member, accessRoles } = item;

  // TODO: check edit draft Report and edit draft Dashboard controllers
  // if (
  //   (entity as ChartEnt | DashboardEnt | ReportEnt).draft === true &&
  //   member.memberId !==
  //     (entity as ChartEnt | DashboardEnt | ReportEnt).creatorId
  // ) {
  //   return false;
  // }

  if (member.isAdmin === true || member.isEditor === true) {
    return true;
  }

  if (accessRoles.length === 0) {
    return true;
  }

  if (accessRoles.some(x => member.tab.roles.includes(x)) === false) {
    return false;
  }

  return true;
}
