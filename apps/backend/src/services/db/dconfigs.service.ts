import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { DconfigTab } from '~backend/drizzle/postgres/schema/_tabs';
import { DconfigEnt } from '~backend/drizzle/postgres/schema/dconfigs';
import { isUndefined } from '~common/functions/is-undefined';
import { DconfigLt, DconfigSt } from '~common/interfaces/st-lt';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class DconfigsService {
  constructor(
    private hashService: HashService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  entToTab(dconfigEnt: DconfigEnt): DconfigTab {
    if (isUndefined(dconfigEnt)) {
      return;
    }

    let dconfig: DconfigTab = {
      ...dconfigEnt,
      ...this.tabService.decrypt<DconfigSt>({
        encryptedString: dconfigEnt.st
      }),
      ...this.tabService.decrypt<DconfigLt>({
        encryptedString: dconfigEnt.lt
      })
    };

    return dconfig;
  }
}
