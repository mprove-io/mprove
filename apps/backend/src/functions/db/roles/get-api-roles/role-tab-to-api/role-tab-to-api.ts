import type { RoleTab } from '#backend/drizzle/postgres/tables/roles';
import type { Role } from '#common/types/backend/parts/role';

export function roleTabToApi(item: { role: RoleTab }): Role {
  let { role } = item;

  let apiRole: Role = {
    projectId: role.projectId,
    roleId: role.roleId,
    gvs: role.gvs.sort((a, b) =>
      a.givenId > b.givenId ? 1 : b.givenId > a.givenId ? -1 : 0
    )
  };

  return apiRole;
}
