import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type {
  ConnectionTab,
  EnvTab,
  MemberTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { envsTable } from '#backend/drizzle/postgres/schema/envs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { makeFullName } from '#backend/functions/make-full-name/make-full-name';
import { DbService } from '#backend/services/db/db.service';
import { HashService } from '#backend/services/hash/hash.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckEnvDoesNotExistError } from '#common/types/backend/function-errors/check-env-does-not-exist-error';
import type { DbConnectionsFindManyError } from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import type { DbEnvsFindFirstError } from '#common/types/backend/function-errors/db/envs/db-envs-find-first-error';
import type { DbEnvsFindManyError } from '#common/types/backend/function-errors/db/envs/db-envs-find-many-error';
import type { DbMembersFindManyError } from '#common/types/backend/function-errors/db/members/db-members-find-many-error';
import type { GetApiEnvConnectionsWithFallbackError } from '#common/types/backend/function-errors/get-api-env-connections-with-fallback-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { GetEnvCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import type { Env } from '#common/types/backend/parts/env';
import type { EnvUser } from '#common/types/backend/parts/env-user';
import type { EnvsItem } from '#common/types/backend/parts/envs-item';
import type { Ev } from '#common/types/backend/parts/ev';

export type GetApiEnvConnectionsWithFallbackOutput = {
  apiEnv: Env;
  connectionsWithFallback: ConnectionTab[];
};

@Injectable()
export class EnvsService {
  constructor(
    private hashService: HashService,
    private db: DbService
  ) {}

  makeEnv(item: { projectId: string; envId: string; evs: Ev[] }): EnvTab {
    let { projectId, envId, evs } = item;

    let env: EnvTab = {
      envFullId: this.hashService.makeEnvFullId({
        projectId: projectId,
        envId: envId
      }),
      projectId: projectId,
      envId: envId,
      memberIds: [],
      isFallbackToProdConnections: true,
      isFallbackToProdVariables: true,
      useProdCache: true,
      evs: evs,
      keyTag: undefined,
      serverTs: undefined
    };

    return env;
  }

  wrapToApiEnvsItem(item: { env: EnvTab }): EnvsItem {
    let { env } = item;

    let apiEnvsItem: EnvsItem = {
      projectId: env.projectId,
      envId: env.envId
    };

    return apiEnvsItem;
  }

  wrapToApiEnvUser(item: { member: MemberTab }): EnvUser {
    let { member } = item;

    let apiEnvUser: EnvUser = {
      userId: member.memberId,
      alias: member.alias,
      firstName: member.firstName,
      lastName: member.lastName,
      fullName: makeFullName({
        firstName: member.firstName,
        lastName: member.lastName
      })
    };

    return apiEnvUser;
  }

  tabToApi(item: {
    env: EnvTab;
    envConnectionIds: string[];
    fallbackConnectionIds: string[];
    fallbackEvs: Ev[];
    envMembers: MemberTab[];
  }): Env {
    let {
      env,
      envConnectionIds,
      fallbackConnectionIds,
      fallbackEvs,
      envMembers
    } = item;

    let envUsers: EnvUser[] = envMembers.map(member => {
      let envUser: EnvUser = {
        userId: member.memberId,
        alias: member.alias,
        firstName: member.firstName,
        lastName: member.lastName,
        fullName: makeFullName({
          firstName: member.firstName,
          lastName: member.lastName
        })
      };

      return envUser;
    });

    let apiEnv: Env = {
      projectId: env.projectId,
      envId: env.envId,
      envConnectionIds: envConnectionIds,
      fallbackConnectionIds: fallbackConnectionIds,
      envConnectionIdsWithFallback: [
        ...envConnectionIds,
        ...fallbackConnectionIds
      ].sort((a, b) => (a > b ? 1 : b > a ? -1 : 0)),
      evs: env.evs,
      fallbackEvIds: fallbackEvs.map(x => x.evId),
      evsWithFallback: [...env.evs, ...fallbackEvs].sort((a, b) =>
        a.evId > b.evId ? 1 : b.evId > a.evId ? -1 : 0
      ),
      envUsers: envUsers,
      isFallbackToProdConnections: env.isFallbackToProdConnections,
      isFallbackToProdVariables: env.isFallbackToProdVariables,
      useProdCache: env.useProdCache
    };

    return apiEnv;
  }

  async checkEnvDoesNotExist(item: {
    projectId: string;
    envId: string;
  }): Result.ResultAsync<void, CheckEnvDoesNotExistError> {
    let { projectId, envId } = item;

    let isEnvExist: boolean = await this.db.envs.isExistUnwrap({
      where: and(eq(envsTable.envId, envId), eq(envsTable.projectId, projectId))
    });

    if (isEnvExist) {
      return Result.fail({
        code: 'BACKEND_ENV_ALREADY_EXISTS'
      });
    }

    return Result.succeed();
  }

  async getEnvCheckExistsAndAccess(item: {
    projectId: string;
    envId: string;
    member: MemberTab;
  }): Result.ResultAsync<EnvTab, GetEnvCheckExistsAndAccessError> {
    let { projectId, envId, member } = item;

    let envResult: Result.Result<EnvTab, DbEnvsFindFirstError> =
      await this.db.envs.findFirst({
        where: and(
          eq(envsTable.envId, envId),
          eq(envsTable.projectId, projectId)
        )
      });

    if (Result.isFailure(envResult)) {
      return envResult;
    }

    let env: EnvTab = envResult.value;

    if (isUndefined(env)) {
      return Result.fail({
        code: 'BACKEND_ENV_DOES_NOT_EXIST'
      });
    }

    if (envId !== PROJECT_ENV_PROD && member.isAdmin === false) {
      if (env.memberIds.indexOf(member.memberId) < 0) {
        return Result.fail({
          code: 'BACKEND_MEMBER_DOES_NOT_HAVE_ACCESS_TO_ENV'
        });
      }
    }

    return Result.succeed(env);
  }

  async getApiEnvs(item: {
    projectId: string;
  }): Result.ResultAsync<Env[], GetApiEnvsError> {
    let { projectId } = item;

    let envResult: Result.Result<EnvTab[], DbEnvsFindManyError> =
      await this.db.envs.findMany({
        where: eq(connectionsTable.projectId, projectId)
      });

    if (Result.isFailure(envResult)) {
      return envResult;
    }

    let envs: EnvTab[] = envResult.value;

    let connectionResult: Result.Result<
      ConnectionTab[],
      DbConnectionsFindManyError
    > = await this.db.connections.findMany({
      where: and(
        eq(connectionsTable.projectId, projectId),
        inArray(
          connectionsTable.envId,
          envs.map(x => x.envId)
        )
      )
    });

    if (Result.isFailure(connectionResult)) {
      return connectionResult;
    }

    let connections: ConnectionTab[] = connectionResult.value;

    let memberResult: Result.Result<MemberTab[], DbMembersFindManyError> =
      await this.db.members.findMany({
        where: eq(membersTable.projectId, projectId)
      });

    if (Result.isFailure(memberResult)) {
      return memberResult;
    }

    let members: MemberTab[] = memberResult.value;

    let prodEnv: EnvTab = envs.find(x => x.envId === PROJECT_ENV_PROD);

    let apiEnvs: Env[] = envs
      .map(env => {
        let envConnectionIds = connections
          .filter(y => y.envId === env.envId)
          .map(connection => connection.connectionId);

        let apiEnv: Env = this.tabToApi({
          env: env,
          envConnectionIds: envConnectionIds,
          fallbackConnectionIds:
            env.isFallbackToProdConnections === true
              ? connections
                  .filter(
                    y =>
                      y.envId === PROJECT_ENV_PROD &&
                      envConnectionIds.indexOf(y.connectionId) < 0
                  )
                  .map(connection => connection.connectionId)
              : [],
          fallbackEvs:
            env.isFallbackToProdVariables === true
              ? prodEnv.evs.filter(
                  y => env.evs.map(ev => ev.evId).indexOf(y.evId) < 0
                )
              : [],
          envMembers:
            env.envId === PROJECT_ENV_PROD
              ? []
              : members.filter(m => env.memberIds.indexOf(m.memberId) > -1)
        });

        return apiEnv;
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

    return Result.succeed(apiEnvs);
  }

  async getApiEnvConnectionsWithFallback(item: {
    projectId: string;
    envId: string;
  }): Result.ResultAsync<
    GetApiEnvConnectionsWithFallbackOutput,
    GetApiEnvConnectionsWithFallbackError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsError> =>
          this.getApiEnvs({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'apiEnv',
        (v): Result.Result<Env, never> =>
          Result.succeed(v.apiEnvs.find(x => x.envId === v.envId))
      ),
      Result.bind(
        'connectionsWithFallback',
        (v): Result.ResultAsync<ConnectionTab[], DbConnectionsFindManyError> =>
          this.db.connections.findMany({
            where: and(
              eq(connectionsTable.projectId, v.projectId),
              inArray(
                connectionsTable.connectionId,
                v.apiEnv.envConnectionIdsWithFallback
              )
            )
          })
      ),
      Result.map(
        (v): GetApiEnvConnectionsWithFallbackOutput => ({
          apiEnv: v.apiEnv,
          connectionsWithFallback: v.connectionsWithFallback
        })
      )
    );
  }
}
