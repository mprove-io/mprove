import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { BridgeEnt } from '~backend/drizzle/postgres/schema/bridges';
import {
  DashboardEnt,
  dashboardsTable
} from '~backend/drizzle/postgres/schema/dashboards';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { MemberEnt } from '~backend/drizzle/postgres/schema/members';
import { ModelEnt, modelsTable } from '~backend/drizzle/postgres/schema/models';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { checkAccess } from '~backend/functions/check-access';
import { ErEnum } from '~common/enums/er.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { Dashboard } from '~common/interfaces/blockml/dashboard';
import { ServerError } from '~common/models/server-error';
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

    if (isUndefined(dashboard)) {
      throw new ServerError({
        message: ErEnum.BACKEND_DASHBOARD_DOES_NOT_EXIST
      });
    }

    return dashboard;
  }

  checkDashboardPath(item: { filePath: string; userAlias: string }) {
    if (item.filePath.split('/')[2] !== item.userAlias) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_DASHBOARD_PATH
      });
    }
  }

  async getDashboardXCheckAccess(item: {
    projectId: string;
    dashboard: DashboardEnt;
    member: MemberEnt;
    user: UserEnt;
    bridge: BridgeEnt;
  }) {
    let { projectId, dashboard, member, user, bridge } = item;

    let isAccessGranted = checkAccess({
      userAlias: user.alias,
      member: member,
      entity: dashboard
    });

    if (isAccessGranted === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_DASHBOARD
      });
    }

    let mconfigIds = dashboard.tiles.map(x => x.mconfigId);
    let mconfigs =
      mconfigIds.length === 0
        ? []
        : await this.db.drizzle.query.mconfigsTable.findMany({
            where: inArray(mconfigsTable.mconfigId, mconfigIds)
          });

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

    let models = await this.db.drizzle.query.modelsTable.findMany({
      where: eq(modelsTable.structId, bridge.structId)
    });

    let apiModels = models.map(model =>
      this.wrapToApiService.wrapToApiModel({
        model: model,
        hasAccess: checkAccess({
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

  async getDashboardParts(item: {
    structId: string;
    user: UserEnt;
    userMember: MemberEnt;
    newDashboard: Dashboard;
  }) {
    let { structId, user, userMember, newDashboard } = item;

    let dashboardParts = (await this.db.drizzle
      .select({
        dashboardId: dashboardsTable.dashboardId,
        draft: dashboardsTable.draft,
        creatorId: dashboardsTable.creatorId,
        filePath: dashboardsTable.filePath,
        accessRoles: dashboardsTable.accessRoles,
        title: dashboardsTable.title,
        gr: dashboardsTable.gr,
        hidden: dashboardsTable.hidden,
        fields: dashboardsTable.fields,
        tiles: dashboardsTable.tiles,
        description: dashboardsTable.description
      })
      .from(dashboardsTable)
      .where(
        and(
          eq(dashboardsTable.dashboardId, newDashboard.dashboardId),
          eq(dashboardsTable.structId, structId),
          newDashboard.draft === true
            ? eq(dashboardsTable.creatorId, user.userId)
            : eq(dashboardsTable.draft, false)
        )
      )) as DashboardEnt[];

    let dashboardPartsGrantedAccess = dashboardParts.filter(x =>
      checkAccess({
        userAlias: user.alias,
        member: userMember,
        entity: x
      })
    );

    let modelIdsWithDuplicates = newDashboard.tiles.map(tile => tile.modelId);
    let uniqueModelIds = [...new Set(modelIdsWithDuplicates)];

    let models = (await this.db.drizzle
      .select({
        modelId: modelsTable.modelId,
        accessRoles: modelsTable.accessRoles,
        hidden: modelsTable.hidden,
        connectionId: modelsTable.connectionId
      })
      .from(modelsTable)
      .where(
        and(
          eq(modelsTable.structId, structId),
          inArray(modelsTable.modelId, uniqueModelIds)
        )
      )) as ModelEnt[];

    let newDashboardParts = dashboardPartsGrantedAccess.map(x =>
      this.wrapToApiService.wrapToApiDashboard({
        dashboard: x,
        mconfigs: [],
        queries: [],
        member: this.wrapToApiService.wrapToApiMember(userMember),
        models: models.map(model =>
          this.wrapToApiService.wrapToApiModel({
            model: model,
            hasAccess: checkAccess({
              userAlias: user.alias,
              member: userMember,
              entity: model
            })
          })
        ),
        isAddMconfigAndQuery: false
      })
    );

    return newDashboardParts;
  }
}
