import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
import {
  MemberEnt,
  membersTable
} from '~backend/drizzle/postgres/schema/members';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ProjectConnection } from '~common/interfaces/blockml/project-connection';
import { ServerError } from '~common/models/server-error';
import { WrapToApiService } from './wrap-to-api.service';

@Injectable()
export class EnvsService {
  constructor(
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async checkEnvDoesNotExist(item: { projectId: string; envId: string }) {
    let { projectId, envId } = item;

    let env = await this.db.drizzle.query.envsTable.findFirst({
      where: and(eq(envsTable.envId, envId), eq(envsTable.projectId, projectId))
    });

    if (isDefined(env)) {
      throw new ServerError({
        message: ErEnum.BACKEND_ENV_ALREADY_EXISTS
      });
    }
  }

  async getEnvCheckExistsAndAccess(item: {
    projectId: string;
    envId: string;
    member: MemberEnt;
  }) {
    let { projectId, envId, member } = item;

    let env = await this.db.drizzle.query.envsTable.findFirst({
      where: and(eq(envsTable.envId, envId), eq(envsTable.projectId, projectId))
    });

    if (isUndefined(env)) {
      throw new ServerError({
        message: ErEnum.BACKEND_ENV_DOES_NOT_EXIST
      });
    }

    if (
      envId !== PROJECT_ENV_PROD &&
      member.isAdmin === false &&
      env.memberIds.indexOf(member.memberId) < 0
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_MEMBER_DOES_NOT_HAVE_ACCESS_TO_ENV
      });
    }

    return env;
  }

  async getApiEnvs(item: { projectId: string }) {
    let { projectId } = item;

    let envs = await this.db.drizzle.query.envsTable.findMany({
      where: eq(connectionsTable.projectId, projectId)
    });

    let connections = await this.db.drizzle.query.connectionsTable.findMany({
      where: and(
        eq(connectionsTable.projectId, projectId),
        inArray(
          connectionsTable.envId,
          envs.map(x => x.envId)
        )
      )
    });

    let members = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.projectId, projectId)
    });

    let prodEnv = envs.find(x => x.envId === PROJECT_ENV_PROD);

    let apiEnvs = envs
      .map(x => {
        let envConnectionIds = connections
          .filter(y => y.envId === x.envId)
          .map(connection => connection.connectionId);

        return this.wrapToApiService.wrapToApiEnv({
          env: x,
          envConnectionIds: envConnectionIds,
          fallbackConnectionIds:
            x.isFallbackToProdConnections === true
              ? connections
                  .filter(
                    y =>
                      y.envId === PROJECT_ENV_PROD &&
                      envConnectionIds.indexOf(y.connectionId) < 0
                  )
                  .map(connection => connection.connectionId)
              : [],
          fallbackEvs:
            x.isFallbackToProdVariables === true
              ? prodEnv.evs.filter(
                  y => x.evs.map(ev => ev.evId).indexOf(y.evId) < 0
                )
              : [],
          envMembers:
            x.envId === PROJECT_ENV_PROD
              ? []
              : members.filter(m => x.memberIds.indexOf(m.memberId) > -1)
        });
      })
      .sort((a, b) =>
        a.envId !== PROJECT_ENV_PROD && b.envId === PROJECT_ENV_PROD
          ? 1
          : a.envId === PROJECT_ENV_PROD && b.envId !== PROJECT_ENV_PROD
            ? -1
            : a.envId > b.envId
              ? 1
              : b.envId > a.envId
                ? -1
                : 0
      );

    return apiEnvs;
  }

  async getApiEnvConnectionsWithFallback(item: {
    projectId: string;
    envId: string;
  }) {
    let { projectId, envId } = item;

    let apiEnvs = await this.getApiEnvs({
      projectId: projectId
    });

    let apiEnv = apiEnvs.find(x => x.envId === envId);

    let connectionsEntsWithFallback =
      await this.db.drizzle.query.connectionsTable.findMany({
        where: and(
          eq(connectionsTable.projectId, projectId),
          inArray(
            connectionsTable.connectionId,
            apiEnv.envConnectionIdsWithFallback
          )
        )
      });

    let connectionsWithFallback: ProjectConnection[] =
      connectionsEntsWithFallback.map(
        x =>
          <ProjectConnection>{
            connectionId: x.connectionId,
            type: x.type,
            googleCloudProject: x.googleCloudProject,
            serviceAccountCredentials: x.serviceAccountCredentials,
            host: x.host,
            port: x.port,
            username: x.username,
            password: x.password,
            databaseName: x.database
          }
      );

    return {
      apiEnv,
      connectionsWithFallback
    };
  }
}
