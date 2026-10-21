import { Result } from '@praha/byethrow';
import type { ProviderTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ProviderEnt } from '#backend/drizzle/postgres/schema/providers';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { HashService } from '#backend/services/hash/hash.service';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ProviderLt } from '#common/types/shared/st-lt/providers/provider-lt';
import type { ProviderSt } from '#common/types/shared/st-lt/providers/provider-st';

export function providerTabToEnt(item: {
  tab: ProviderTab;
  hashService: HashService;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<ProviderEnt, never> {
  let { tab, hashService, tabService, isEncryptDb, isEncryptMetadata } = item;

  let providerSt: ProviderSt = {
    name: tab.name,
    options: tab.options
  };

  let providerLt: ProviderLt = {
    emptyData: tab.emptyData
  };

  let providerEnt: ProviderEnt = {
    providerFullId: hashService.makeProviderFullId({
      projectId: tab.projectId,
      providerId: tab.providerId
    }),
    projectId: tab.projectId,
    providerId: tab.providerId,
    type: tab.type,
    isEnabled: tab.isEnabled,
    models: tab.models,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: providerSt,
      dataLt: providerLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(providerEnt);
}
