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
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { checkAccess } from '~backend/functions/check-access';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MalloyService } from '~backend/services/malloy.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Query } from '~common/interfaces/blockml/query';
import {
  ToBackendCreateTempMconfigAndQueryRequest,
  ToBackendCreateTempMconfigAndQueryResponsePayload
} from '~common/interfaces/to-backend/mconfigs/to-backend-create-temp-mconfig-and-query';
import { ServerError } from '~common/models/server-error';
import { getYYYYMMDDFromEpochUtcByTimezone } from '~node-common/functions/get-yyyymmdd-from-epoch-utc-by-timezone';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateTempMconfigAndQueryController {
  constructor(
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private malloyService: MalloyService,
    private wrapToEntService: WrapToEntService,
    private wrapToApiService: WrapEnxToApiService,
    private mconfigsService: MconfigsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateTempMconfigAndQuery)
  async createTempMconfigAndQuery(
    @AttachUser() user: UserTab,
    @Req() request: any
  ) {
    let reqValid: ToBackendCreateTempMconfigAndQueryRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      mconfig,
      projectId,
      isRepoProd,
      branchId,
      envId,
      cellMetricsStartDateMs,
      cellMetricsEndDateMs,
      queryOperations
    } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
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
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: mconfig.modelId
    });

    if (mconfig.structId !== bridge.structId) {
      throw new ServerError({
        message: ErEnum.BACKEND_STRUCT_ID_CHANGED
      });
    }

    let isAccessGranted = checkAccess({
      userAlias: user.alias,
      member: member,
      entity: model
    });

    if (isAccessGranted === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let newMconfig: Mconfig;
    let newQuery: Query;

    let isError = false;

    if (model.type === ModelTypeEnum.Store) {
      // if (model.isStoreModel === true) {
      // console.log('createMconfigAndQuery prepStoreMconfigQuery');

      let mqe = await this.mconfigsService.prepStoreMconfigQuery({
        struct: struct,
        project: project,
        envId: envId,
        model: model,
        mconfig: mconfig,
        metricsStartDateYYYYMMDD: isDefined(cellMetricsStartDateMs)
          ? getYYYYMMDDFromEpochUtcByTimezone({
              timezone: mconfig.timezone,
              secondsEpochUTC: cellMetricsStartDateMs / 1000
            })
          : undefined,
        metricsEndDateYYYYMMDD: isDefined(cellMetricsEndDateMs)
          ? getYYYYMMDDFromEpochUtcByTimezone({
              timezone: mconfig.timezone,
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
        model: model,
        mconfig: mconfig,
        queryOperations: queryOperations
      });

      isError = editMalloyQueryResult.isError;
      newMconfig = editMalloyQueryResult.newMconfig;
      newQuery = editMalloyQueryResult.newQuery;
    }

    let newQueryEnt = this.wrapToEntService.wrapToEntityQuery(newQuery);
    let newMconfigEnt = this.wrapToEntService.wrapToEntityMconfig(newMconfig);

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                mconfigs: [newMconfigEnt]
              },
              insertOrUpdate: {
                queries: isError === true ? [newQueryEnt] : []
              },
              insertOrDoNothing: {
                queries: isError === true ? [] : [newQueryEnt]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let query = await this.db.drizzle.query.queriesTable.findFirst({
      where: and(
        eq(queriesTable.queryId, newQuery.queryId),
        eq(queriesTable.projectId, newQuery.projectId)
      )
    });

    let payload: ToBackendCreateTempMconfigAndQueryResponsePayload = {
      mconfig: this.wrapToApiService.wrapToApiMconfig({
        mconfig: newMconfigEnt,
        modelFields: model.fields
      }),
      query: isDefined(query)
        ? this.wrapToApiService.wrapToApiQuery(query)
        : this.wrapToApiService.wrapToApiQuery(newQueryEnt)
    };

    return payload;
  }
}
