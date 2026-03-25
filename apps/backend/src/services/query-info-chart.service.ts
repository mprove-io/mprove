import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MconfigTab,
  MemberTab,
  ProjectTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ChartsService } from '#backend/services/db/charts.service';
import { MconfigsService } from '#backend/services/db/mconfigs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { QueriesService } from '#backend/services/db/queries.service';
import { StructsService } from '#backend/services/db/structs.service';
import { MalloyService } from '#backend/services/malloy.service';
import { TabService } from '#backend/services/tab.service';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { QueryOperationTypeEnum } from '#common/enums/query-operation-type.enum';
import { makeCopy } from '#common/functions/make-copy';
import { QueryOperation } from '#common/interfaces/backend/query-operation';
import type { ToBackendGetChartResponsePayload } from '#common/interfaces/to-backend/charts/to-backend-get-chart';
import { ServerError } from '#common/models/server-error';

@Injectable()
export class QueryInfoChartService {
  constructor(
    private tabService: TabService,
    private malloyService: MalloyService,
    private chartsService: ChartsService,
    private mconfigsService: MconfigsService,
    private modelsService: ModelsService,
    private queriesService: QueriesService,
    private membersService: MembersService,
    private structsService: StructsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getChartData(item: {
    traceId: string;
    user: UserTab;
    userMember: MemberTab;
    project: ProjectTab;
    projectId: string;
    envId: string;
    structId: string;
    chartId: string;
    timezone: string;
    skipUi: boolean;
  }): Promise<ToBackendGetChartResponsePayload> {
    let {
      traceId,
      user,
      userMember,
      project,
      projectId,
      envId,
      structId,
      chartId,
      timezone,
      skipUi
    } = item;

    if (userMember.isExplorer === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_MEMBER_IS_NOT_EXPLORER
      });
    }

    let struct = await this.structsService.getStructCheckExists({
      structId: structId,
      projectId: projectId
    });

    let chart = await this.chartsService.getChartCheckExists({
      structId: structId,
      chartId: chartId,
      userMember: userMember,
      user: user
    });

    let chartMconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: structId,
      mconfigId: chart.tiles[0].mconfigId
    });

    let model = await this.modelsService.getModelCheckExistsAndAccess({
      structId: structId,
      modelId: chartMconfig.modelId,
      userMember: userMember
    });

    let newMconfig: MconfigTab;
    let newQuery: QueryTab;
    let isError = false;

    if (model.type === ModelTypeEnum.Store) {
      chartMconfig.timezone = timezone;

      let mqe = await this.mconfigsService.prepStoreMconfigQuery({
        struct: struct,
        project: project,
        envId: envId,
        mconfigParentType: chartMconfig.parentType,
        mconfigParentId: chartMconfig.parentId,
        model: model,
        mconfig: chartMconfig,
        metricsStartDateYYYYMMDD: undefined,
        metricsEndDateYYYYMMDD: undefined
      });

      newMconfig = mqe.newMconfig;
      newQuery = mqe.newQuery;
      isError = mqe.isError;
    } else if (model.type === ModelTypeEnum.Malloy) {
      let queryOperation: QueryOperation = {
        type: QueryOperationTypeEnum.Get,
        timezone: timezone
      };

      let editMalloyQueryResult = await this.malloyService.editMalloyQuery({
        projectId: projectId,
        envId: envId,
        structId: struct.structId,
        mconfigParentType: chartMconfig.parentType,
        mconfigParentId: chartMconfig.parentId,
        model: model,
        mconfig: chartMconfig,
        queryOperations: [queryOperation]
      });

      newMconfig = editMalloyQueryResult.newMconfig;
      newQuery = editMalloyQueryResult.newQuery;
      isError = editMalloyQueryResult.isError;
    }

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                mconfigs: [newMconfig]
              },
              insertOrUpdate: {
                queries: isError === true ? [newQuery] : []
              },
              insertOrDoNothing: {
                queries: isError === false ? [newQuery] : []
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let query = await this.db.drizzle.query.queriesTable
      .findFirst({
        where: and(
          eq(queriesTable.queryId, newQuery.queryId),
          eq(queriesTable.projectId, newQuery.projectId)
        )
      })
      .then(x => this.tabService.queryEntToTab(x));

    chart.tiles[0].mconfigId = newMconfig.mconfigId;
    chart.tiles[0].queryId = newMconfig.queryId;

    if (skipUi === false) {
      user.ui = user.ui || makeCopy(DEFAULT_SRV_UI);
      user.ui.timezone = timezone;

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  users: [user]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let payload: ToBackendGetChartResponsePayload = {
      userMember: apiUserMember,
      chart: this.chartsService.tabToApi({
        chart: chart,
        mconfigs: [
          this.mconfigsService.tabToApi({
            mconfig: newMconfig,
            modelFields: model.fields
          })
        ],
        queries: [this.queriesService.tabToApi({ query: query })],
        member: apiUserMember,
        models: [
          this.modelsService.tabToApi({
            model: model,
            hasAccess: checkModelAccess({
              member: userMember,
              modelAccessRoles: model.accessRoles
            })
          })
        ],
        isAddMconfigAndQuery: true
      })
    };

    return payload;
  }
}
