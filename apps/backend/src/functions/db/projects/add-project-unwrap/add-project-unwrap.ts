import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { addProject } from '#backend/functions/db/projects/add-project/add-project';
import type { DbService } from '#backend/services/db/db.service';
import type { RpcService } from '#backend/services/rpc/rpc.service';
import type { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { AddProjectError } from '#common/types/backend/function-errors/add-project-error';
import type { Ev } from '#common/types/backend/parts/ev';
import type { ProjectRemoteType } from '#common/types/backend/parts/project/project-remote-type';

export async function addProjectUnwrap(item: {
  projectId: string;
  orgId: string;
  remoteType: ProjectRemoteType;
  name: string;
  gitUrl?: string;
  publicKey?: string;
  privateKey?: string;
  publicKeyEncrypted?: string;
  privateKeyEncrypted?: string;
  passPhrase?: string;
  e2bApiKey?: string;
  seedProjectId: string;
  user: UserTab;
  evs: Ev[];
  connections: ConnectionTab[];
  traceId: string;
  tabService: TabService;
  rpcService: RpcService;
  db: DbService;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): Promise<ProjectTab> {
  let { tabService, rpcService, db, cs, logger } = item;

  let result: Result.Result<ProjectTab, AddProjectError> = await addProject({
    projectId: item.projectId,
    orgId: item.orgId,
    remoteType: item.remoteType,
    name: item.name,
    gitUrl: item.gitUrl,
    publicKey: item.publicKey,
    privateKey: item.privateKey,
    publicKeyEncrypted: item.publicKeyEncrypted,
    privateKeyEncrypted: item.privateKeyEncrypted,
    passPhrase: item.passPhrase,
    e2bApiKey: item.e2bApiKey,
    seedProjectId: item.seedProjectId,
    user: item.user,
    evs: item.evs,
    connections: item.connections,
    traceId: item.traceId,
    tabService: tabService,
    rpcService: rpcService,
    db: db,
    cs: cs,
    logger: logger
  });

  if (Result.isFailure(result)) {
    throw new ServerError({
      message: result.error.code,
      customData:
        'customData' in result.error ? result.error.customData : undefined,
      displayData:
        result.error.code === 'BACKEND_INVALID_REQUEST'
          ? result.error.displayData
          : undefined,
      originalError:
        (result.error.code === 'BACKEND_ERROR_RESPONSE_FROM_DISK' ||
          result.error.code === 'BACKEND_ERROR_RESPONSE_FROM_BLOCKML') &&
        result.error.originalError
          ? Object.assign(new Error(result.error.originalError.code), {
              displayData:
                'displayData' in result.error.originalError
                  ? result.error.originalError.displayData
                  : undefined
            })
          : undefined
    });
  }

  let project: ProjectTab = result.value;

  return project;
}
