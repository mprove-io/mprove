import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MconfigTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { QueriesService } from '#backend/services/db/queries.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { MalloyService } from '#backend/services/malloy.service';
import { ParentService } from '#backend/services/parent.service';
import { TabService } from '#backend/services/tab.service';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { UTC } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { QueryOperationTypeEnum } from '#common/enums/query-operation-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { makeCopy } from '#common/functions/make-copy';
import { makeId } from '#common/functions/make-id';
import { QueryOperation } from '#common/interfaces/backend/query-operation';
import { Mconfig } from '#common/interfaces/blockml/mconfig';
import {
  ToBackendSuggestDimensionValuesRequest,
  ToBackendSuggestDimensionValuesResponsePayload
} from '#common/interfaces/to-backend/mconfigs/to-backend-suggest-dimension-values';
import { getYYYYMMDDFromEpochUtcByTimezone } from '#node-common/functions/get-yyyymmdd-from-epoch-utc-by-timezone';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SuggestDimensionValuesController {
  constructor(
    private tabService: TabService,
    private parentService: ParentService,
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private malloyService: MalloyService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSuggestDimensionValues)
  async suggestDimensionValues(
    @AttachUser() user: UserTab,
    @Req() request: any
  ) {
    let reqValid: ToBackendSuggestDimensionValuesRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      repoId,
      branchId,
      envId,
      structId,
      modelId,
      fieldId,
      chartId,
      dashboardId,
      reportId,
      rowId,
      term,
      cellMetricsStartDateMs,
      cellMetricsEndDateMs
    } = reqValid.payload;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let struct = await this.structsService.getStructCheckExistsAndNotChanged({
      projectId: projectId,
      bridgeStructId: bridge.structId,
      structId: structId
    });

    let parentId = isDefined(dashboardId)
      ? dashboardId
      : isDefined(reportId)
        ? reportId
        : isDefined(chartId)
          ? chartId
          : undefined;

    let parentType = isDefined(dashboardId)
      ? MconfigParentTypeEnum.SuggestDimensionDashboard
      : isDefined(reportId)
        ? MconfigParentTypeEnum.SuggestDimensionReport
        : isDefined(chartId)
          ? MconfigParentTypeEnum.SuggestDimensionChart
          : MconfigParentTypeEnum.SuggestDimensionModel;

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: modelId
    });

    await this.parentService.checkAccess({
      parentId: parentId,
      parentType: parentType,
      modelId: modelId,
      user: user,
      userMember: userMember,
      structId: bridge.structId,
      projectId: projectId,
      isCheckSuggest: true,
      suggestFieldId: fieldId,
      suggestRowId: rowId,
      suggestModel: model
    });

    let apiMconfig: Mconfig;

    let queryOperations: QueryOperation[];

    if (model.type === ModelTypeEnum.Store) {
      apiMconfig = {
        structId: bridge.structId,
        mconfigId: makeId(),
        queryId: makeId(),
        modelId: modelId,
        modelType: ModelTypeEnum.Store,
        parentType: parentType,
        parentId: parentId,
        dateRangeIncludesRightSide: undefined, // adjustMconfig overrides it
        storePart: undefined,
        modelLabel: model.label,
        modelFilePath: model.filePath,
        malloyQueryStable: undefined,
        malloyQueryExtra: undefined,
        compiledQuery: undefined,
        select: [fieldId],
        sortings: [],
        sorts: `${fieldId}`,
        timezone: UTC,
        limit: 500,
        filters: isDefinedAndNotEmpty(term)
          ? [
              {
                fieldId: fieldId,
                fractions: [
                  {
                    brick: `%${term}%`,
                    parentBrick: `%${term}%`,
                    type: FractionTypeEnum.StringContains,
                    operator: FractionOperatorEnum.Or
                  }
                ]
              }
            ]
          : [],
        chart: makeCopy(DEFAULT_CHART),
        serverTs: 1
      };
    } else if (model.type === ModelTypeEnum.Malloy) {
      apiMconfig = {
        structId: bridge.structId,
        mconfigId: makeId(),
        queryId: makeId(),
        modelId: modelId,
        modelType: ModelTypeEnum.Malloy,
        parentType: parentType,
        parentId: parentId,
        dateRangeIncludesRightSide: undefined,
        storePart: undefined,
        modelLabel: model.label,
        modelFilePath: model.filePath,
        malloyQueryStable: undefined,
        malloyQueryExtra: undefined,
        compiledQuery: undefined,
        select: [],
        sortings: [],
        sorts: undefined,
        timezone: UTC,
        limit: 500,
        filters: [],
        chart: makeCopy(DEFAULT_CHART),
        serverTs: 1
      };

      let queryOperation1: QueryOperation = {
        type: QueryOperationTypeEnum.GroupOrAggregatePlusSort,
        fieldId: fieldId,
        sortFieldId: fieldId,
        desc: false,
        timezone: apiMconfig.timezone
      };

      let queryOperation2: QueryOperation = isDefinedAndNotEmpty(term)
        ? {
            type: QueryOperationTypeEnum.WhereOrHaving,
            timezone: apiMconfig.timezone,
            filters: [
              {
                fieldId: fieldId,
                fractions: [
                  {
                    brick: `f\`%${term}%\``,
                    parentBrick: `f\`%${term}%\``,
                    type: FractionTypeEnum.StringContains,
                    operator: FractionOperatorEnum.Or,
                    stringValue: term
                  }
                ]
              }
            ]
          }
        : undefined;

      queryOperations = isDefined(queryOperation2)
        ? [queryOperation1, queryOperation2]
        : [queryOperation1];
    }

    let newMconfig: MconfigTab;
    let newQuery: QueryTab;
    let isError = false;

    if (model.type === ModelTypeEnum.Store) {
      let mqe = await this.mconfigsService.prepStoreMconfigQuery({
        struct: struct,
        project: project,
        envId: envId,
        model: model,
        mconfigParentType: apiMconfig.parentType,
        mconfigParentId: apiMconfig.parentId,
        mconfig: this.mconfigsService.apiToTab({ apiMconfig: apiMconfig }),
        metricsStartDateYYYYMMDD: isDefined(cellMetricsStartDateMs)
          ? getYYYYMMDDFromEpochUtcByTimezone({
              timezone: apiMconfig.timezone,
              secondsEpochUTC: cellMetricsStartDateMs / 1000
            })
          : undefined,
        metricsEndDateYYYYMMDD: isDefined(cellMetricsEndDateMs)
          ? getYYYYMMDDFromEpochUtcByTimezone({
              timezone: apiMconfig.timezone,
              secondsEpochUTC: cellMetricsEndDateMs / 1000
            })
          : undefined
      });

      newMconfig = mqe.newMconfig;
      newQuery = mqe.newQuery;
      isError = mqe.isError;
    } else if (model.type === ModelTypeEnum.Malloy) {
      let editMalloyQueryResult = await this.malloyService.editMalloyQuery({
        projectId: projectId,
        envId: envId,
        structId: struct.structId,
        mconfigParentType: apiMconfig.parentType,
        mconfigParentId: apiMconfig.parentId,
        model: model,
        mconfig: this.mconfigsService.apiToTab({ apiMconfig: apiMconfig }),
        queryOperations: queryOperations
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
                queries: isError === true ? [] : [newQuery]
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

    let payload: ToBackendSuggestDimensionValuesResponsePayload = {
      mconfig: this.mconfigsService.tabToApi({
        mconfig: newMconfig,
        modelFields: model.fields
      }),
      query: this.queriesService.tabToApi({
        query: isDefined(query) ? query : newQuery
      })
    };

    return payload;
  }
}
