import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
import { EnvEnt } from '~backend/drizzle/postgres/schema/envs';
import {
  MemberEnt,
  membersTable
} from '~backend/drizzle/postgres/schema/members';
import { EnvLt, EnvSt, EnvTab } from '~backend/drizzle/postgres/tabs/env-tab';
import { MemberTab } from '~backend/drizzle/postgres/tabs/member-tab';
import { makeFullName } from '~backend/functions/make-full-name';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { Env } from '~common/interfaces/backend/env';
import { EnvUser } from '~common/interfaces/backend/env-user';
import { EnvsItem } from '~common/interfaces/backend/envs-item';
import { Ev } from '~common/interfaces/backend/ev';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';
import { ConnectionsService } from './connections.service';
import { MembersService } from './members.service';

@Injectable()
export class EnvsService {
  constructor(
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeEnvEnt(item: { projectId: string; envId: string; evs: Ev[] }): EnvEnt {
    let { projectId, envId, evs } = item;

    let envSt: EnvSt = { evs: evs };
    let envLt: EnvLt = {};

    let envEnt: EnvEnt = {
      envFullId: this.hashService.makeEnvFullId({
        projectId: projectId,
        envId: envId
      }),
      projectId: projectId,
      envId: envId,
      memberIds: [],
      isFallbackToProdConnections: true,
      isFallbackToProdVariables: true,
      st: this.tabService.encrypt({ data: envSt }),
      lt: this.tabService.encrypt({ data: envLt }),
      serverTs: undefined
    };

    return envEnt;
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
      alias: member.st.alias,
      firstName: member.st.firstName,
      lastName: member.st.lastName,
      fullName: makeFullName({
        firstName: member.st.firstName,
        lastName: member.st.lastName
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
        alias: member.st.alias,
        firstName: member.st.firstName,
        lastName: member.st.lastName,
        fullName: makeFullName({
          firstName: member.st.firstName,
          lastName: member.st.lastName
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
      evs: env.st.evs,
      fallbackEvIds: fallbackEvs.map(x => x.evId),
      evsWithFallback: [...env.st.evs, ...fallbackEvs].sort((a, b) =>
        a.evId > b.evId ? 1 : b.evId > a.evId ? -1 : 0
      ),
      envUsers: envUsers,
      isFallbackToProdConnections: env.isFallbackToProdConnections,
      isFallbackToProdVariables: env.isFallbackToProdVariables
    };

    return apiEnv;
  }

  tabToEnt(env: EnvTab): EnvEnt {
    let orgEnt: EnvEnt = {
      // ...env,
      st: this.tabService.encrypt({ data: env.st }),
      lt: this.tabService.encrypt({ data: env.lt })
    };

    return orgEnt;
  }

  entToTab(env: EnvEnt): EnvTab {
    let orgTab: EnvTab = {
      ...env,
      st: this.tabService.decrypt<EnvSt>({
        encryptedString: env.st
      }),
      lt: this.tabService.decrypt<EnvLt>({
        encryptedString: env.lt
      })
    };

    return orgTab;
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

    let envEnts: EnvEnt[] = await this.db.drizzle.query.envsTable.findMany({
      where: eq(connectionsTable.projectId, projectId)
    });

    let envTabs: EnvTab[] = envEnts.map(x => this.entToTab(x));

    let connectionEnts = await this.db.drizzle.query.connectionsTable.findMany({
      where: and(
        eq(connectionsTable.projectId, projectId),
        inArray(
          connectionsTable.envId,
          envEnts.map(x => x.envId)
        )
      )
    });

    let memberEnts = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.projectId, projectId)
    });

    let memberTabs = memberEnts.map(x => this.membersService.entToTab(x));

    let prodEnvEnt = envEnts.find(x => x.envId === PROJECT_ENV_PROD);

    let prodEnvTab = this.entToTab(prodEnvEnt);

    let apiEnvs = envTabs
      .map(x => {
        let envConnectionIds = connectionEnts
          .filter(y => y.envId === x.envId)
          .map(connection => connection.connectionId);

        let apiEnv: Env = this.tabToApi({
          env: x,
          envConnectionIds: envConnectionIds,
          fallbackConnectionIds:
            x.isFallbackToProdConnections === true
              ? connectionEnts
                  .filter(
                    y =>
                      y.envId === PROJECT_ENV_PROD &&
                      envConnectionIds.indexOf(y.connectionId) < 0
                  )
                  .map(connection => connection.connectionId)
              : [],
          fallbackEvs:
            x.isFallbackToProdVariables === true
              ? prodEnvTab.st.evs.filter(
                  y => x.st.evs.map(ev => ev.evId).indexOf(y.evId) < 0
                )
              : [],
          envMembers:
            x.envId === PROJECT_ENV_PROD
              ? []
              : memberTabs.filter(m => x.memberIds.indexOf(m.memberId) > -1)
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
      connectionsEntsWithFallback.map(x =>
        this.connectionsService.tabToApi({
          connection: this.connectionsService.entToTab(x),
          isIncludePasswords: true
        })
      );

    return {
      apiEnv,
      connectionsWithFallback
    };
  }
}
