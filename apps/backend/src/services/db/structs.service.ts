import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { StructTab } from '~backend/drizzle/postgres/schema/_tabs';
import { chartsTable } from '~backend/drizzle/postgres/schema/charts';
import { dashboardsTable } from '~backend/drizzle/postgres/schema/dashboards';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import {
  StructEnt,
  structsTable
} from '~backend/drizzle/postgres/schema/structs';
import {
  EMPTY_STRUCT_ID,
  PROJECT_CONFIG_CURRENCY_PREFIX,
  PROJECT_CONFIG_CURRENCY_SUFFIX,
  PROJECT_CONFIG_DEFAULT_TIMEZONE,
  PROJECT_CONFIG_FORMAT_NUMBER,
  PROJECT_CONFIG_THOUSANDS_SEPARATOR
} from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { Struct } from '~common/interfaces/backend/struct';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class StructsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  entToTab(structEnt: StructEnt): StructTab {
    if (isUndefined(structEnt)) {
      return;
    }

    let struct: StructTab = {
      ...structEnt,
      ...this.tabService.getTabProps({ ent: structEnt })
    };

    return struct;
  }

  tabToApi(item: { struct: StructTab }): Struct {
    let { struct } = item;

    let apiStruct: Struct = {
      projectId: struct.projectId,
      structId: struct.structId,
      errors: struct.errors,
      metrics: struct.metrics,
      presets: struct.presets,
      mproveConfig: struct.mproveConfig,
      mproveVersion: struct.mproveVersion,
      serverTs: Number(struct.serverTs)
    };

    return apiStruct;
  }

  async getStructCheckExists(item: {
    structId: string;
    projectId: string;
    isGetEmptyStructOnError?: boolean;
  }) {
    let { structId, projectId, isGetEmptyStructOnError } = item;

    let emptyStruct: StructTab = {
      structId: structId,
      projectId: projectId,
      errors: [],
      metrics: [],
      presets: [],
      mproveConfig: {
        mproveDirValue: './data',
        weekStart: ProjectWeekStartEnum.Sunday,
        allowTimezones: true,
        caseSensitiveStringFilters: false,
        defaultTimezone: PROJECT_CONFIG_DEFAULT_TIMEZONE,
        formatNumber: PROJECT_CONFIG_FORMAT_NUMBER,
        currencyPrefix: PROJECT_CONFIG_CURRENCY_PREFIX,
        currencySuffix: PROJECT_CONFIG_CURRENCY_SUFFIX,
        thousandsSeparator: PROJECT_CONFIG_THOUSANDS_SEPARATOR
      },
      mproveVersion:
        this.cs.get<BackendConfig['mproveReleaseTag']>('mproveReleaseTag'),
      keyTag: undefined,
      serverTs: undefined
    };

    let struct: StructTab;

    if (structId === EMPTY_STRUCT_ID) {
      struct = emptyStruct;
    } else {
      struct = await this.db.drizzle.query.structsTable
        .findFirst({
          where: and(
            eq(structsTable.structId, structId),
            eq(structsTable.projectId, projectId)
          )
        })
        .then(x => this.entToTab(x));

      if (isUndefined(struct)) {
        if (isGetEmptyStructOnError === true) {
          struct = emptyStruct;
        } else {
          throw new ServerError({
            message: ErEnum.BACKEND_STRUCT_DOES_NOT_EXIST
          });
        }
      }
    }

    return struct;
  }

  async removeOrphanedStructs() {
    let rawData: any = await this.db.drizzle.execute(sql`
SELECT
  s.struct_id,
  b.project_id,
  b.repo_id,
  b.branch_id,
  b.env_id
FROM structs AS s
LEFT JOIN bridges AS b ON s.struct_id = b.struct_id
LEFT JOIN branches AS c ON b.branch_id = c.branch_id
WHERE c.branch_id IS NULL AND to_timestamp(s.server_ts/1000) < (NOW() - INTERVAL '15 seconds');
`);

    let orphanedStructIds: string[] =
      rawData.rows.map((x: any) => x.struct_id) || [];

    orphanedStructIds = orphanedStructIds.filter(
      x => [EMPTY_STRUCT_ID].indexOf(x) < 0
    );

    if (orphanedStructIds.length > 0) {
      await this.db.drizzle
        .delete(structsTable)
        .where(inArray(structsTable.structId, orphanedStructIds));

      await this.db.drizzle
        .delete(chartsTable)
        .where(inArray(chartsTable.structId, orphanedStructIds));

      await this.db.drizzle
        .delete(modelsTable)
        .where(inArray(modelsTable.structId, orphanedStructIds));

      await this.db.drizzle
        .delete(reportsTable)
        .where(inArray(reportsTable.structId, orphanedStructIds));

      await this.db.drizzle
        .delete(mconfigsTable)
        .where(inArray(mconfigsTable.structId, orphanedStructIds));

      await this.db.drizzle
        .delete(dashboardsTable)
        .where(inArray(dashboardsTable.structId, orphanedStructIds));
    }
  }
}
