import { Inject, Injectable } from '@nestjs/common';
import { isNotNull } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { DconfigTab } from '~backend/drizzle/postgres/schema/_tabs';
import {
  DconfigEnt,
  dconfigsTable
} from '~backend/drizzle/postgres/schema/dconfigs';
import { isUndefined } from '~common/functions/is-undefined';
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
      ...this.tabService.getTabProps({ ent: dconfigEnt })
    };

    return dconfig;
  }

  async getDconfigHashSecret() {
    let dconfig = await this.db.drizzle.query.dconfigsTable
      .findFirst({
        where: isNotNull(dconfigsTable.dconfigId)
      })
      .then(x => this.entToTab(x));

    return dconfig?.hashSecret;
  }
}
