import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { dashboardsTable } from '~backend/drizzle/postgres/schema/dashboards';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { WrapToApiService } from './wrap-to-api.service';

@Injectable()
export class DashboardsService {
  constructor(
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getDashboardCheckExists(item: {
    dashboardId: string;
    structId: string;
  }) {
    let { dashboardId, structId } = item;

    let dashboard = await this.db.drizzle.query.dashboardsTable.findFirst({
      where: and(
        eq(dashboardsTable.structId, structId),
        eq(dashboardsTable.dashboardId, dashboardId)
      )
    });

    // let dashboard = await this.dashboardsRepository.findOne({
    //   where: {
    //     struct_id: structId,
    //     dashboard_id: dashboardId
    //   }
    // });

    if (common.isUndefined(dashboard)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_DASHBOARD_DOES_NOT_EXIST
      });
    }

    return dashboard;
  }

  checkDashboardPath(item: { filePath: string; userAlias: string }) {
    if (item.filePath.split('/')[2] !== item.userAlias) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_DASHBOARD_PATH
      });
    }
  }

  async getDashboardXCheckAccess(item: {
    projectId: string;
    dashboard: schemaPostgres.DashboardEnt;
    member: schemaPostgres.MemberEnt;
    user: schemaPostgres.UserEnt;
    bridge: schemaPostgres.BridgeEnt;
  }) {
    let { projectId, dashboard, member, user, bridge } = item;

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: member,
      entity: dashboard
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_DASHBOARD
      });
    }

    let mconfigIds = dashboard.tiles.map(x => x.mconfigId);
    let mconfigs =
      mconfigIds.length === 0
        ? []
        : await this.db.drizzle.query.mconfigsTable.findMany({
            where: inArray(mconfigsTable.mconfigId, mconfigIds)
          });

    // await this.mconfigsRepository.find({
    //     where: {
    //       mconfig_id: In(mconfigIds)
    //     }
    //   })

    let queryIds = dashboard.tiles.map(x => x.queryId);
    let queries =
      queryIds.length === 0
        ? []
        : await this.db.drizzle.query.queriesTable.findMany({
            where: and(
              inArray(queriesTable.queryId, queryIds),
              eq(queriesTable.projectId, projectId)
            )
          });

    // await this.queriesRepository.find({
    //     where: {
    //       query_id: In(queryIds),
    //       project_id: projectId
    //     }
    //   });

    let models = await this.db.drizzle.query.modelsTable.findMany({
      where: eq(modelsTable.structId, bridge.structId)
    });

    // let models = await this.modelsRepository.find({
    //   where: {
    //     struct_id: bridge.struct_id
    //   }
    // });

    let apiModels = models.map(model =>
      this.wrapToApiService.wrapToApiModel({
        model: model,
        hasAccess: helper.checkAccess({
          userAlias: user.alias,
          member: member,
          entity: model
        })
      })
    );

    let dashboardX = this.wrapToApiService.wrapToApiDashboard({
      dashboard: dashboard,
      mconfigs: mconfigs.map(x =>
        this.wrapToApiService.wrapToApiMconfig({
          mconfig: x,
          modelFields: apiModels.find(m => m.modelId === x.modelId).fields
        })
      ),
      queries: queries.map(x => this.wrapToApiService.wrapToApiQuery(x)),
      member: this.wrapToApiService.wrapToApiMember(member),
      models: apiModels,
      isAddMconfigAndQuery: true
    });

    return dashboardX;
  }
}
