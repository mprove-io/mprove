import { Result } from '@praha/byethrow';
import type { KitTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { KitEnt } from '#backend/drizzle/postgres/schema/kits';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { KitLt } from '#common/types/shared/st-lt/kits/kit-lt';
import type { KitSt } from '#common/types/shared/st-lt/kits/kit-st';

export function kitTabToEnt(item: {
  tab: KitTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<KitEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let kitSt: KitSt = {};
  let kitLt: KitLt = {
    data: tab.data
  };

  let kitEnt: KitEnt = {
    kitId: tab.kitId,
    structId: tab.structId,
    reportId: tab.reportId,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: kitSt,
      dataLt: kitLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(kitEnt);
}
