import type { RoleTab } from '#backend/drizzle/postgres/schema/_tabs';
import { makeRoleFullId } from '#backend/functions/hash/make-role-full-id/make-role-full-id';
import type { Gv } from '#common/types/backend/parts/gv';

export function makeRole(item: {
  projectId: string;
  roleId: string;
  gvs: Gv[];
}): RoleTab {
  let { projectId, roleId, gvs } = item;

  let role: RoleTab = {
    roleFullId: makeRoleFullId({
      projectId: projectId,
      roleId: roleId
    }),
    projectId: projectId,
    roleId: roleId,
    gvs: gvs,
    keyTag: undefined,
    serverTs: undefined
  };

  return role;
}
