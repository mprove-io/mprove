import { Result } from '@praha/byethrow';
import type {
  UconfigEnt,
  UconfigTab
} from '#backend/drizzle/postgres/tables/uconfigs';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { UconfigLt } from '#common/types/shared/st-lt/uconfigs/uconfig-lt';
import type { UconfigSt } from '#common/types/shared/st-lt/uconfigs/uconfig-st';

export function uconfigTabToEnt(item: {
  tab: UconfigTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<UconfigEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let uconfigSt: UconfigSt = {};
  let uconfigLt: UconfigLt = {};

  let uconfigEnt: UconfigEnt = {
    uconfigId: tab.uconfigId,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: uconfigSt,
      dataLt: uconfigLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(uconfigEnt);
}
