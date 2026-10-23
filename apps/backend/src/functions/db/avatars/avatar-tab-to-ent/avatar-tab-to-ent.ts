import { Result } from '@praha/byethrow';
import type { AvatarTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { AvatarEnt } from '#backend/drizzle/postgres/schema/avatars';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { AvatarLt } from '#common/types/shared/st-lt/avatars/avatar-lt';
import type { AvatarSt } from '#common/types/shared/st-lt/avatars/avatar-st';

export function avatarTabToEnt(item: {
  tab: AvatarTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<AvatarEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let avatarSt: AvatarSt = {
    avatarSmall: tab.avatarSmall
  };

  let avatarLt: AvatarLt = {
    avatarBig: tab.avatarBig
  };

  let avatarEnt: AvatarEnt = {
    userId: tab.userId,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: avatarSt,
      dataLt: avatarLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(avatarEnt);
}
