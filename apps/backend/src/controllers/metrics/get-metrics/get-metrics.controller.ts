import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { metricsTable } from '~backend/drizzle/postgres/schema/metrics';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetMetricsController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMetrics)
  async getMetrics(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetMetricsRequest = request.body;

    let { projectId, isRepoProd, branchId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? common.PROD_REPO_ID : user.userId,
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

    let metrics = await this.db.drizzle.query.metricsTable.findMany({
      where: eq(metricsTable.structId, bridge.structId)
    });

    // let metrics = await this.metricsRepository.find({
    //   where: { struct_id: bridge.struct_id }
    // });

    let draftReports = await this.db.drizzle.query.reportsTable.findMany({
      where: and(
        eq(reportsTable.draft, true),
        eq(reportsTable.creatorId, user.userId),
        eq(reportsTable.structId, bridge.structId)
      )
    });

    // let draftReps = await this.repsRepository.find({
    //   where: {
    //     draft: true,
    //     creator_id: user.user_id,
    //     struct_id: bridge.struct_id
    //   }
    // });

    let structReports = await this.db.drizzle.query.reportsTable.findMany({
      where: and(
        eq(reportsTable.draft, false),
        eq(reportsTable.structId, bridge.structId)
      )
    });

    // let structReps = await this.repsRepository.find({
    //   where: {
    //     draft: false,
    //     struct_id: bridge.struct_id
    //   }
    // });

    let reportsGrantedAccess = structReports.filter(x =>
      helper.checkAccess({
        userAlias: user.alias,
        member: userMember,
        entity: x
      })
    );

    let reports = [
      ...draftReports
        .sort((a, b) =>
          a.draftCreatedTs > b.draftCreatedTs
            ? 1
            : b.draftCreatedTs > a.draftCreatedTs
            ? -1
            : 0
        )
        .reverse(),
      ...reportsGrantedAccess.sort((a, b) => {
        let aTitle = a.title.toLowerCase() || a.reportId.toLowerCase();
        let bTitle = b.title.toLowerCase() || a.reportId.toLowerCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      })
    ];

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let modelIds = metrics
      .filter(m => common.isDefined(m.modelId))
      .map(x => x.modelId);

    let models = await this.db.drizzle.query.modelsTable.findMany({
      where: and(
        inArray(modelsTable.modelId, modelIds),
        eq(modelsTable.structId, struct.structId)
      )
    });

    // let models = await this.modelsRepository.find({
    //   where: {
    //     model_id: In(modelIds),
    //     struct_id: struct.structId
    //   }
    // });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetMetricsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      userMember: apiMember,
      metrics: metrics.map(x =>
        this.wrapToApiService.wrapToApiMetric({ metric: x })
      ),
      reports: reports.map(x =>
        this.wrapToApiService.wrapToApiReport({
          report: x,
          member: apiMember,
          columns: [],
          models: models.map(model =>
            this.wrapToApiService.wrapToApiModel({
              model: model,
              hasAccess: helper.checkAccess({
                userAlias: user.alias,
                member: userMember,
                entity: model
              })
            })
          ),
          timezone: undefined,
          timeSpec: undefined,
          timeRangeFraction: undefined,
          rangeOpen: undefined,
          rangeClose: undefined,
          metricsStartDateYYYYMMDD: undefined,
          metricsEndDateExcludedYYYYMMDD: undefined,
          metricsEndDateIncludedYYYYMMDD: undefined,
          timeColumnsLimit: undefined,
          timeColumnsLength: undefined,
          isTimeColumnsLimitExceeded: false
        })
      ),
      storeModels: models
        .filter(model => model.isStoreModel === true)
        .map(model =>
          this.wrapToApiService.wrapToApiModel({
            model: model,
            hasAccess: helper.checkAccess({
              userAlias: user.alias,
              member: userMember,
              entity: model
            })
          })
        )
    };

    return payload;
  }
}
