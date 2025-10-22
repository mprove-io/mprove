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
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  MconfigTab,
  QueryTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MconfigsService } from '~backend/services/db/mconfigs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ModelsService } from '~backend/services/db/models.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { StructsService } from '~backend/services/db/structs.service';
import { MalloyService } from '~backend/services/malloy.service';
import { ParentService } from '~backend/services/parent.service';
import { TabService } from '~backend/services/tab.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { setChartFields } from '~common/functions/set-chart-fields';
import { setChartTitleOnSelectChange } from '~common/functions/set-chart-title-on-select-change';
import { sortChartFieldsOnSelectChange } from '~common/functions/sort-chart-fields-on-select-change';
import { sortFieldsOnSelectChange } from '~common/functions/sort-fields-on-select-change';
import { QueryOperation } from '~common/interfaces/backend/query-operation';
import {
  ToBackendGroupMetricByDimensionRequest,
  ToBackendGroupMetricByDimensionResponsePayload
} from '~common/interfaces/to-backend/mconfigs/to-backend-group-metric-by-dimension';
import { ServerError } from '~common/models/server-error';
import { getYYYYMMDDFromEpochUtcByTimezone } from '~node-common/functions/get-yyyymmdd-from-epoch-utc-by-timezone';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GroupMetricByDimensionController {
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
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGroupMetricByDimension)
  async groupMetricByDimension(
    @AttachUser() user: UserTab,
    @Req() request: any
  ) {
    let reqValid: ToBackendGroupMetricByDimensionRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      timezone,
      mconfigId,
      groupByFieldId,
      cellMetricsStartDateMs,
      cellMetricsEndDateMs
    } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

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

    let oldMconfig = await this.mconfigsService.getMconfigCheckExists({
      mconfigId: mconfigId,
      structId: bridge.structId
    });

    await this.parentService.checkAccess({
      mconfig: oldMconfig,
      user: user,
      userMember: userMember,
      structId: bridge.structId,
      projectId: projectId
    });

    if (oldMconfig.structId !== bridge.structId) {
      throw new ServerError({
        message: ErEnum.BACKEND_STRUCT_ID_CHANGED
      });
    }

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    // user can group metric by without model access - OK
    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: oldMconfig.modelId
    });

    let apiMconfig = this.mconfigsService.tabToApi({
      mconfig: oldMconfig,
      modelFields: model.fields
    });

    apiMconfig.timezone = timezone;

    let queryOperation: QueryOperation;

    if (apiMconfig.modelType === ModelTypeEnum.Malloy) {
      let { queryOperationType, sortFieldId, desc } = sortFieldsOnSelectChange({
        mconfig: apiMconfig,
        selectFieldId: groupByFieldId,
        modelFields: model.fields,
        mconfigFields: apiMconfig.fields
      });

      queryOperation = {
        type: queryOperationType,
        fieldId: groupByFieldId,
        sortFieldId: sortFieldId,
        desc: desc,
        timezone: apiMconfig.timezone
      };
    } else {
      apiMconfig.select = [...apiMconfig.select, groupByFieldId];

      apiMconfig = setChartTitleOnSelectChange({
        mconfig: apiMconfig,
        fields: model.fields
      });

      apiMconfig = setChartFields({
        mconfig: apiMconfig,
        fields: model.fields
      });

      apiMconfig = sortChartFieldsOnSelectChange({
        mconfig: apiMconfig,
        fields: model.fields
      });
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

    let payload: ToBackendGroupMetricByDimensionResponsePayload = {
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
