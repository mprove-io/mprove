import { Result } from '@praha/byethrow';
import type { RoleEnt, RoleTab } from '#backend/drizzle/postgres/tables/roles';
import { makeRoleFullId } from '#backend/functions/db/roles/make-role-full-id/make-role-full-id';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { RoleLt } from '#common/types/shared/st-lt/roles/role-lt';
import type { RoleSt } from '#common/types/shared/st-lt/roles/role-st';

export function roleTabToEnt(item: {
  tab: RoleTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<RoleEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let roleSt: RoleSt = { gvs: tab.gvs };

  let roleLt: RoleLt = {};

  let roleEnt: RoleEnt = {
    roleFullId: makeRoleFullId({
      projectId: tab.projectId,
      roleId: tab.roleId
    }),
    projectId: tab.projectId,
    roleId: tab.roleId,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: roleSt,
      dataLt: roleLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(roleEnt);
}
