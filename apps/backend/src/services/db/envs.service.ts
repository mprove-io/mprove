import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { Env } from '#common/interfaces/backend/env';
import { EnvUser } from '#common/interfaces/backend/env-user';
import { EnvsItem } from '#common/interfaces/backend/envs-item';
import { Ev } from '#common/interfaces/backend/ev';
import { ServerError } from '#common/models/server-error';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import { EnvTab, MemberTab } from '~backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { makeFullName } from '~backend/functions/make-full-name';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class EnvsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
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
      isFallbackToProdVariables: env.isFallbackToProdVariables
    };

    return apiEnv;
  }

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
    member: MemberTab;
  }) {
    let { projectId, envId, member } = item;

    let env = await this.db.drizzle.query.envsTable
      .findFirst({
        where: and(
          eq(envsTable.envId, envId),
          eq(envsTable.projectId, projectId)
        )
      })
      .then(x => this.tabService.envEntToTab(x));

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

    let envs = await this.db.drizzle.query.envsTable
      .findMany({
        where: eq(connectionsTable.projectId, projectId)
      })
      .then(xs => xs.map(x => this.tabService.envEntToTab(x)));

    let connections = await this.db.drizzle.query.connectionsTable
      .findMany({
        where: and(
          eq(connectionsTable.projectId, projectId),
          inArray(
            connectionsTable.envId,
            envs.map(x => x.envId)
          )
        )
      })
      .then(xs => xs.map(x => this.tabService.connectionEntToTab(x)));

    let members = await this.db.drizzle.query.membersTable
      .findMany({
        where: eq(membersTable.projectId, projectId)
      })
      .then(xs => xs.map(x => this.tabService.memberEntToTab(x)));

    let prodEnv = envs.find(x => x.envId === PROJECT_ENV_PROD);

    let apiEnvs = envs
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

    let connectionsWithFallback = await this.db.drizzle.query.connectionsTable
      .findMany({
        where: and(
          eq(connectionsTable.projectId, projectId),
          inArray(
            connectionsTable.connectionId,
            apiEnv.envConnectionIdsWithFallback
          )
        )
      })
      .then(xs => xs.map(x => this.tabService.connectionEntToTab(x)));

    return {
      apiEnv,
      connectionsWithFallback
    };
  }
}
