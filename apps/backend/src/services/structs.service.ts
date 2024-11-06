import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { dashboardsTable } from '~backend/drizzle/postgres/schema/dashboards';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { metricsTable } from '~backend/drizzle/postgres/schema/metrics';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { structsTable } from '~backend/drizzle/postgres/schema/structs';
import { vizsTable } from '~backend/drizzle/postgres/schema/vizs';
import { ProjectWeekStartEnum } from '~common/_index';

@Injectable()
export class StructsService {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  async getStructCheckExists(item: {
    structId: string;
    projectId: string;
    skipError?: boolean;
  }) {
    let { structId, projectId, skipError } = item;

    let emptyStruct: schemaPostgres.StructEnt = {
      structId: structId,
      projectId: projectId,
      mproveDirValue: './data',
      weekStart: ProjectWeekStartEnum.Monday,
      allowTimezones: true,
      defaultTimezone: 'UTC',
      formatNumber: ',.0f',
      currencyPrefix: '$',
      currencySuffix: '',
      errors: [],
      views: [],
      udfsDict: {},
      serverTs: undefined
    };

    // let emptyStruct = maker.makeStruct({
    //   projectId: projectId,
    //   structId: structId,
    //   mproveDirValue: './data',
    //   weekStart: ProjectWeekStartEnum.Monday,
    //   allowTimezones: BoolEnum.TRUE,
    //   defaultTimezone: 'UTC',
    //   formatNumber: ',.0f',
    //   currencyPrefix: '$',
    //   currencySuffix: '',
    //   errors: [],
    //   views: [],
    //   udfsDict: {}
    // });

    let struct;

    if (structId === common.EMPTY_STRUCT_ID) {
      struct = emptyStruct;
    } else {
      struct = await this.db.drizzle.query.structsTable.findFirst({
        where: and(
          eq(structsTable.structId, structId),
          eq(structsTable.projectId, projectId)
        )
      });

      // struct = await this.structsRepository.findOne({
      //   where: {
      //     struct_id: structId,
      //     project_id: projectId
      //   }
      // });

      if (common.isUndefined(struct)) {
        if (skipError === true) {
          struct = emptyStruct;
        } else {
          throw new common.ServerError({
            message: common.ErEnum.BACKEND_STRUCT_DOES_NOT_EXIST
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
FROM structs as s
LEFT JOIN bridges as b ON s.struct_id=b.struct_id
LEFT JOIN branches as c ON b.branch_id=c.branch_id
WHERE c.branch_id is NULL AND s.server_ts < (NOW() - INTERVAL 1 MINUTE)
`);

    //     let rawData: any;

    //     await this.dataSource.transaction(async manager => {
    //       rawData = await manager.query(`
    // SELECT
    //   s.struct_id,
    //   b.project_id,
    //   b.repo_id,
    //   b.branch_id,
    //   b.env_id
    // FROM structs as s
    // LEFT JOIN bridges as b ON s.struct_id=b.struct_id
    // LEFT JOIN branches as c ON b.branch_id=c.branch_id
    // WHERE c.branch_id is NULL AND s.server_ts < (NOW() - INTERVAL 1 MINUTE)
    // `);
    //     });

    let orphanedStructIds: string[] =
      rawData?.map((x: any) => x.struct_id) || [];

    orphanedStructIds = orphanedStructIds.filter(
      x => [common.EMPTY_STRUCT_ID].indexOf(x) < 0
    );

    if (orphanedStructIds.length > 0) {
      await this.db.drizzle
        .delete(structsTable)
        .where(inArray(structsTable.structId, orphanedStructIds));

      await this.db.drizzle
        .delete(vizsTable)
        .where(inArray(vizsTable.structId, orphanedStructIds));

      await this.db.drizzle
        .delete(modelsTable)
        .where(inArray(modelsTable.structId, orphanedStructIds));

      await this.db.drizzle
        .delete(metricsTable)
        .where(inArray(metricsTable.structId, orphanedStructIds));

      await this.db.drizzle
        .delete(reportsTable)
        .where(inArray(reportsTable.structId, orphanedStructIds));

      await this.db.drizzle
        .delete(mconfigsTable)
        .where(inArray(mconfigsTable.structId, orphanedStructIds));

      await this.db.drizzle
        .delete(dashboardsTable)
        .where(inArray(dashboardsTable.structId, orphanedStructIds));

      // await this.structsRepository.delete({ struct_id: In(orphanedStructIds) });
      // await this.vizsRepository.delete({ struct_id: In(orphanedStructIds) });
      // await this.modelsRepository.delete({ struct_id: In(orphanedStructIds) });
      // await this.metricsRepository.delete({ struct_id: In(orphanedStructIds) });
      // await this.repsRepository.delete({ struct_id: In(orphanedStructIds) });
      // await this.mconfigsRepository.delete({
      //   struct_id: In(orphanedStructIds)
      // });
      // await this.dashboardsRepository.delete({
      //   struct_id: In(orphanedStructIds)
      // });
    }
  }
}
