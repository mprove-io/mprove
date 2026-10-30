import { Result } from '@praha/byethrow';
import type {
  ConnectionEnt,
  ConnectionTab
} from '#backend/drizzle/postgres/tables/connections';
import { makeConnectionFullId } from '#backend/functions/db/connections/make-connection-full-id/make-connection-full-id';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ConnectionLt } from '#common/types/shared/st-lt/connections/connection-lt';
import type { ConnectionSt } from '#common/types/shared/st-lt/connections/connection-st';

export function connectionTabToEnt(item: {
  tab: ConnectionTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<ConnectionEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let connectionSt: ConnectionSt = { options: tab.options };

  let connectionLt: ConnectionLt = { rawSchema: tab.rawSchema };

  let connectionEnt: ConnectionEnt = {
    connectionFullId: makeConnectionFullId({
      projectId: tab.projectId,
      envId: tab.envId,
      connectionId: tab.connectionId
    }),
    projectId: tab.projectId,
    envId: tab.envId,
    connectionId: tab.connectionId,
    type: tab.type,
    serverTs: undefined,
    ...getEntProps({
      dataSt: connectionSt,
      dataLt: connectionLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(connectionEnt);
}
