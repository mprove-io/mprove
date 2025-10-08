import { Injectable } from '@nestjs/common';
import { EnvEnt } from '~backend/drizzle/postgres/schema/envs';
import { EnvLt, EnvSt, EnvTab } from '~backend/drizzle/postgres/tabs/env-tab';
import { MemberTab } from '~backend/drizzle/postgres/tabs/member-tab';
import { makeFullName } from '~backend/functions/make-full-name';
import { Env } from '~common/interfaces/backend/env';
import { EnvUser } from '~common/interfaces/backend/env-user';
import { EnvsItem } from '~common/interfaces/backend/envs-item';
import { Ev } from '~common/interfaces/backend/ev';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapEnvService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
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
      ...env,
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
}
