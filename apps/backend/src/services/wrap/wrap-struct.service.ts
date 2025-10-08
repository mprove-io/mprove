import { Injectable } from '@nestjs/common';
import { StructEnt } from '~backend/drizzle/postgres/schema/structs';
import {
  StructLt,
  StructSt,
  StructTab
} from '~backend/drizzle/postgres/tabs/struct-tab';
import { Struct } from '~common/interfaces/backend/struct';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapUserService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  tabToApi(item: { struct: StructTab }): Struct {
    let { struct } = item;

    let apiStruct: Struct = {
      projectId: struct.projectId,
      structId: struct.structId,
      errors: struct.lt.errors,
      metrics: struct.lt.metrics,
      presets: struct.lt.presets,
      mproveConfig: struct.lt.mproveConfig,
      mproveVersion: struct.mproveVersion,
      serverTs: Number(struct.serverTs)
    };

    return apiStruct;
  }

  tabToEnt(struct: StructTab): StructEnt {
    let structEnt: StructEnt = {
      ...struct,
      st: this.tabService.encrypt({ data: struct.st }),
      lt: this.tabService.encrypt({ data: struct.lt })
    };

    return structEnt;
  }

  entToTab(struct: StructEnt): StructTab {
    let structTab: StructTab = {
      ...struct,
      st: this.tabService.decrypt<StructSt>({
        encryptedString: struct.st
      }),
      lt: this.tabService.decrypt<StructLt>({
        encryptedString: struct.lt
      })
    };

    return structTab;
  }
}
