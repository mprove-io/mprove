import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { TabService } from '#backend/services/tab/tab.service';
import type { BaseConnection } from '#common/types/backend/parts/base-connection';
import type { ConnectionLt } from '#common/types/shared/st-lt/connections/connection-lt';
import type { ConnectionSt } from '#common/types/shared/st-lt/connections/connection-st';

export function tabToBaseConnection(item: {
  tabService: TabService;
  connection: ConnectionTab;
}): BaseConnection {
  let { tabService, connection } = item;

  let connectionSt: ConnectionSt = {
    options: connection.options
  };

  let connectionLt: ConnectionLt = { rawSchema: connection.rawSchema };

  let apiBaseConnection: BaseConnection = {
    connectionId: connection.connectionId,
    projectId: connection.projectId,
    envId: connection.envId,
    type: connection.type,
    st: tabService.encrypt({ data: connectionSt }),
    lt: tabService.encrypt({ data: connectionLt })
  };

  return apiBaseConnection;
}
