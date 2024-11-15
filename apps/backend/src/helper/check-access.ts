import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function checkAccess(item: {
  userAlias: string;
  member: schemaPostgres.MemberEnt;
  entity:
    | schemaPostgres.ChartEnt
    | schemaPostgres.ModelEnt
    | schemaPostgres.DashboardEnt
    | schemaPostgres.ReportEnt;
}): boolean {
  let { userAlias, member, entity } = item;

  if (
    common.isDefined((entity as schemaPostgres.ModelEnt).connectionId) && // only models have connection_id
    member.isExplorer === false
  ) {
    return false;
  }

  if (member.isAdmin === true || member.isEditor === true) {
    return true;
  }

  if (entity.accessRoles.length === 0 && entity.accessUsers.length === 0) {
    return true;
  }

  if (
    entity.accessUsers.indexOf(userAlias) < 0 &&
    !entity.accessRoles.some(x => member.roles.includes(x))
  ) {
    return false;
  }

  return true;
}
