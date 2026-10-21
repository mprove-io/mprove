import { Result } from '@praha/byethrow';
import type { DashboardTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { DashboardEnt } from '#backend/drizzle/postgres/schema/dashboards';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { HashService } from '#backend/services/hash/hash.service';
import type { TabService } from '#backend/services/tab/tab.service';
import type { DashboardLt } from '#common/types/shared/st-lt/dashboards/dashboard-lt';
import type { DashboardSt } from '#common/types/shared/st-lt/dashboards/dashboard-st';

export function dashboardTabToEnt(item: {
  tab: DashboardTab;
  hashService: HashService;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<DashboardEnt, never> {
  let { tab, hashService, tabService, isEncryptDb, isEncryptMetadata } = item;

  let dashboardSt: DashboardSt = {
    title: tab.title,
    filePath: tab.filePath,
    space: tab.space,
    accessRoles: tab.accessRoles,
    accessRolesCombined: tab.accessRolesCombined,
    tiles: tab.tiles,
    fields: tab.fields
  };
  let dashboardLt: DashboardLt = { content: tab.content };

  let dashboardEnt: DashboardEnt = {
    dashboardFullId: hashService.makeDashboardFullId({
      structId: tab.structId,
      dashboardId: tab.dashboardId
    }),
    structId: tab.structId,
    dashboardId: tab.dashboardId,
    creatorId: tab.creatorId,
    draft: tab.draft,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: dashboardSt,
      dataLt: dashboardLt,
      isMetadata: true,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(dashboardEnt);
}
