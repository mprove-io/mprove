import { Injectable } from '@nestjs/common';
import { EnvEnt } from '~backend/drizzle/postgres/schema/envs';
import { EnvTab } from '~backend/drizzle/postgres/tabs/env-tab';
import { Ev } from '~common/interfaces/backend/ev';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapBridgeService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  makeEnv(item: { projectId: string; envId: string; evs: Ev[] }): EnvEnt {
    let { projectId, envId, evs } = item;

    let envTab: EnvTab = {
      evs: evs
    };

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
      tab: this.tabService.encrypt({ data: envTab }),
      serverTs: undefined
    };

    return env;
  }
}
