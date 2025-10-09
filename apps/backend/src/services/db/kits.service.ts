import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { KitEnt } from '~backend/drizzle/postgres/schema/kits';
import { KitLt, KitSt, KitTab } from '~backend/drizzle/postgres/tabs/kit-tab';
import { isUndefined } from '~common/functions/is-undefined';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class KitsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  entToTab(kitEnt: KitEnt): KitTab {
    if (isUndefined(kitEnt)) {
      return;
    }

    let kit: KitTab = {
      ...kitEnt,
      ...this.tabService.decrypt<KitSt>({
        encryptedString: kitEnt.st
      }),
      ...this.tabService.decrypt<KitLt>({
        encryptedString: kitEnt.lt
      })
    };

    return kit;
  }
}
