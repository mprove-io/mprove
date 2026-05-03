import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ChartTab,
  MconfigTab,
  MemberTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ChartsService } from '#backend/services/db/charts.service';
import { MconfigsService } from '#backend/services/db/mconfigs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { QueriesService } from '#backend/services/db/queries.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { ExplorerChartRebuildService } from '#backend/services/explorer/explorer-chart-rebuild.service';
import { TabService } from '#backend/services/tab.service';
import { ErEnum } from '#common/enums/er.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendOpenExplorerChartTabResponsePayload } from '#common/zod/to-backend/explorer/to-backend-open-explorer-chart-tab';

@Injectable()
export class OpenExplorerChartTabService {
  constructor(
    private sessionsService: SessionsService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private chartsService: ChartsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private tabService: TabService,
    private explorerChartRebuildService: ExplorerChartRebuildService,
    private runQueriesService: RunQueriesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async openExplorerChartTab(item: {
    user: UserTab;
    traceId: string;
    sessionId: string;
    chartId: string;
  }): Promise<ToBackendOpenExplorerChartTabResponsePayload> {
    let { user, traceId, sessionId, chartId } = item;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({ message: ErEnum.BACKEND_UNAUTHORIZED });
    }

    if (session.type !== SessionTypeEnum.Explorer) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_TYPE_IS_NOT_EXPLORER
      });
    }

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: session.projectId,
      memberId: user.userId
    });

    let bridge = await this.db.drizzle.query.bridgesTable
      .findFirst({
        where: and(
          eq(bridgesTable.projectId, session.projectId),
          eq(bridgesTable.repoId, session.repoId),
          eq(bridgesTable.branchId, session.branchId),
          eq(bridgesTable.envId, session.envId)
        )
      })
      .then(x => this.tabService.bridgeEntToTab(x));

    if (isUndefined(bridge)) {
      throw new ServerError({
        message: ErEnum.BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST
      });
    }

    let originalChart = await this.db.drizzle.query.chartsTable
      .findFirst({
        where: and(
          eq(chartsTable.sessionId, sessionId),
          eq(chartsTable.chartId, chartId)
        )
      })
      .then(x => this.tabService.chartEntToTab(x));

    if (isUndefined(originalChart)) {
      throw new ServerError({ message: ErEnum.BACKEND_CHART_DOES_NOT_EXIST });
    }

    let chartYaml = originalChart.chartYaml;
    let modelId = originalChart.modelId;

    let chartAtCurrent = await this.db.drizzle.query.chartsTable
      .findFirst({
        where: and(
          eq(chartsTable.sessionId, sessionId),
          eq(chartsTable.chartId, chartId),
          eq(chartsTable.structId, bridge.structId)
        )
      })
      .then(x => this.tabService.chartEntToTab(x));

    if (chartAtCurrent) {
      let chartTile = chartAtCurrent.tiles[0];

      let mconfigEnt = await this.db.drizzle.query.mconfigsTable.findFirst({
        where: and(
          eq(mconfigsTable.mconfigId, chartTile.mconfigId),
          eq(mconfigsTable.structId, bridge.structId)
        )
      });

      let mconfig = this.tabService.mconfigEntToTab(mconfigEnt);

      let queryEnt = await this.db.drizzle.query.queriesTable.findFirst({
        where: eq(queriesTable.queryId, chartTile.queryId)
      });

      let query = this.tabService.queryEntToTab(queryEnt);

      if (mconfig && query) {
        let apiPayload = await this.buildApiPayload({
          chart: chartAtCurrent,
          mconfig: mconfig,
          query: query,
          structId: bridge.structId,
          userMember: userMember
        });

        return apiPayload;
      }
    }

    let rebuildResult = await this.explorerChartRebuildService.rebuildFromYaml({
      traceId: traceId,
      session: session,
      chartId: chartId,
      modelId: modelId,
      chartYaml: chartYaml
    });

    if (rebuildResult.ok === false) {
      return { status: 'error', errors: rebuildResult.errors };
    }

    let { chart, mconfig, query } = rebuildResult;

    chart.title = originalChart.title;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                charts: [chart],
                mconfigs: [mconfig]
              },
              insertOrDoNothing: {
                queries: [query]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    await this.runQueriesService.runQueries({
      user: user,
      projectId: session.projectId,
      repoId: session.repoId,
      branchId: session.branchId,
      envId: session.envId,
      mconfigIds: [mconfig.mconfigId]
    });

    let queryEnt = await this.db.drizzle.query.queriesTable.findFirst({
      where: eq(queriesTable.queryId, query.queryId)
    });

    let freshQuery = this.tabService.queryEntToTab(queryEnt) ?? query;

    let apiPayload = await this.buildApiPayload({
      chart: chart,
      mconfig: mconfig,
      query: freshQuery,
      structId: bridge.structId,
      userMember: userMember
    });

    return apiPayload;
  }

  private async buildApiPayload(item: {
    chart: ChartTab;
    mconfig: MconfigTab;
    query: QueryTab;
    structId: string;
    userMember: MemberTab;
  }) {
    let { chart, mconfig, query, structId, userMember } = item;

    let allModels = await this.db.drizzle.query.modelsTable
      .findMany({
        where: eq(modelsTable.structId, structId)
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let model = allModels.find(x => x.modelId === mconfig.modelId);

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let apiModels = allModels.map(m =>
      this.modelsService.tabToApi({
        model: m,
        hasAccess: checkModelAccess({
          member: userMember,
          modelAccessRoles: m.accessRoles
        })
      })
    );

    let apiQuery = this.queriesService.tabToApi({ query: query });

    let mconfigX = this.mconfigsService.tabToApi({
      mconfig: mconfig,
      modelFields: model ? model.fields : []
    });

    let chartX = this.chartsService.tabToApi({
      chart: chart,
      mconfigs: [mconfigX],
      queries: [apiQuery],
      member: apiUserMember,
      models: apiModels,
      isAddMconfigAndQuery: true
    });

    let apiPayload: ToBackendOpenExplorerChartTabResponsePayload = {
      status: 'ok',
      chart: chartX,
      mconfig: mconfigX,
      query: apiQuery
    };

    return apiPayload;
  }
}
