import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
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
  StructLt,
  StructSt,
  StructTab
} from '~backend/drizzle/postgres/tabs/struct-tab';
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

  async getStructCheckExists(item: {
    structId: string;
    projectId: string;
    isGetEmptyStructOnError?: boolean;
    // skipMetrics?: boolean;
  }) {
    let {
      structId,
      projectId,
      isGetEmptyStructOnError
      // , skipMetrics
    } = item;

    let emptyStruct: StructEnt = {
      structId: structId,
      projectId: projectId,
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
      errors: [],
      metrics: [],
      presets: [],
      mproveVersion:
        this.cs.get<BackendConfig['mproveReleaseTag']>('mproveReleaseTag'),
      serverTs: undefined
    };

    let struct: StructEnt;

    if (structId === EMPTY_STRUCT_ID) {
      struct = emptyStruct;
    } else {
      // if (skipMetrics === true) {
      //   let structs = (await this.db.drizzle
      //     .select({
      //       structId: structsTable.structId,
      //       projectId: structsTable.projectId,
      //       mproveConfig: structsTable.mproveConfig,
      //       errors: structsTable.errors,
      //       // metrics: structsTable.metrics,
      //       presets: structsTable.presets,
      //       mproveVersion: structsTable.mproveVersion,
      //       serverTs: structsTable.serverTs
      //     })
      //     .from(structsTable)
      //     .where(
      //       and(
      //         eq(structsTable.structId, structId),
      //         eq(structsTable.projectId, projectId)
      //       )
      //     )) as StructEnt[];

      //   struct = structs.length > 0 ? structs[0] : undefined;

      //   struct.metrics = [];
      // } else {
      struct = await this.db.drizzle.query.structsTable.findFirst({
        where: and(
          eq(structsTable.structId, structId),
          eq(structsTable.projectId, projectId)
        )
      });
      // }

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
