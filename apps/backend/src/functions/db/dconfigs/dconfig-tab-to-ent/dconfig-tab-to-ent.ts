import { Result } from '@praha/byethrow';
import type { DconfigTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { DconfigEnt } from '#backend/drizzle/postgres/schema/dconfigs';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { DconfigLt } from '#common/types/shared/st-lt/dconfigs/dconfig-lt';
import type { DconfigSt } from '#common/types/shared/st-lt/dconfigs/dconfig-st';

export function dconfigTabToEnt(item: {
  tab: DconfigTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<DconfigEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let dconfigSt: DconfigSt = {
    hashSecret: tab.hashSecret,
    hashSecretCheck: tab.hashSecretCheck
  };
  let dconfigLt: DconfigLt = {};

  let dconfigEnt: DconfigEnt = {
    dconfigId: tab.dconfigId,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: dconfigSt,
      dataLt: dconfigLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(dconfigEnt);
}
