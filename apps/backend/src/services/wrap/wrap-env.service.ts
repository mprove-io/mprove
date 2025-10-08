import { Injectable } from '@nestjs/common';
import { EnvEnt } from '~backend/drizzle/postgres/schema/envs';
import { MemberEnt } from '~backend/drizzle/postgres/schema/members';
import { EnvLt, EnvSt, EnvTab } from '~backend/drizzle/postgres/tabs/env-tab';
import { Env } from '~common/interfaces/backend/env';
import { Ev } from '~common/interfaces/backend/ev';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapEnvService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  wrapToApiEnvsItem(item: { env: EnvEnt }): EnvsItem {
    let { env } = item;

    let apiEnvsItem: EnvsItem = {
      projectId: env.projectId,
      envId: env.envId
    };

    return apiEnvsItem;
  }

  wrapToApiEnvUser(item: { member: MemberEnt }): EnvUser {
    let { member } = item;

    let memberTab = this.tabService.decrypt<MemberTab>({
      encryptedString: member.tab
    });

    let apiEnvUser: EnvUser = {
      userId: member.memberId,
      alias: memberTab.alias,
      firstName: memberTab.firstName,
      lastName: memberTab.lastName,
      fullName: makeFullName({
        firstName: memberTab.firstName,
        lastName: memberTab.lastName
      })
    };

    return apiEnvUser;
  }

  tabToApi(item: {
    env: EnvTab;
    envConnectionIds: string[];
    fallbackConnectionIds: string[];
    fallbackEvs: Ev[];
    envMembers: MemberEnt[];
  }): Env {
    let {
      env,
      envConnectionIds,
      fallbackConnectionIds,
      fallbackEvs,
      envMembers
    } = item;

    let envTab = this.tabService.decrypt<EnvTab>({
      encryptedString: env.tab
    });

    let envUsers: EnvUser[] = [];

    envMembers.forEach(member => {
      let memberTab = this.tabService.decrypt<MemberTab>({
        encryptedString: member.tab
      });

      let envUser: EnvUser = {
        userId: member.memberId,
        alias: memberTab.alias,
        firstName: memberTab.firstName,
        lastName: memberTab.lastName,
        fullName: makeFullName({
          firstName: memberTab.firstName,
          lastName: memberTab.lastName
        })
      };

      envUsers.push(envUser);
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
      evs: envTab.evs,
      fallbackEvIds: fallbackEvs.map(x => x.evId),
      evsWithFallback: [...envTab.evs, ...fallbackEvs].sort((a, b) =>
        a.evId > b.evId ? 1 : b.evId > a.evId ? -1 : 0
      ),
      envUsers: envUsers,
      isFallbackToProdConnections: env.isFallbackToProdConnections,
      isFallbackToProdVariables: env.isFallbackToProdVariables
    };

    return apiEnv;
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

  tabToEnt(env: EnvTab): EnvEnt {
    let orgEnt: EnvEnt = {
      ...env,
      st: this.tabService.encrypt({ data: env.st }),
      lt: this.tabService.encrypt({ data: env.lt })
    };

    return orgEnt;
  }

  makeEnvEnt(item: { projectId: string; envId: string; evs: Ev[] }): EnvEnt {
    let { projectId, envId, evs } = item;

    let envSt: EnvSt = { evs: evs };
    let envLt: EnvLt = {};

    let env: EnvEnt = {
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

    return env;
  }
}
