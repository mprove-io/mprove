import { Inject, Injectable } from '@nestjs/common';
import { isNotNull } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { dconfigsTable } from '#backend/drizzle/postgres/schema/dconfigs';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class DconfigsService {
  constructor(
    private hashService: HashService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getDconfigHashSecret() {
    let dconfig = await this.db.drizzle.query.dconfigsTable
      .findFirst({
        where: isNotNull(dconfigsTable.dconfigId)
      })
      .then(x => this.tabService.dconfigEntToTab(x));

    return dconfig?.hashSecret;
  }
}
