import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetMetricsController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private metricsRepository: repositories.MetricsRepository,
    private repsRepository: repositories.RepsRepository,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMetrics)
  async getModels(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetMetricsRequest = request.body;

    let { projectId, isRepoProd, branchId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? common.PROD_REPO_ID : user.user_id,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.project_id,
      repoId: branch.repo_id,
      branchId: branch.branch_id,
      envId: envId
    });

    let metrics = await this.metricsRepository.find({
      where: { struct_id: bridge.struct_id }
    });

    let draftReps = await this.repsRepository.find({
      where: {
        draft: common.BoolEnum.TRUE,
        creator_id: user.user_id
      }
    });

    let structReps = await this.repsRepository.find({
      where: {
        draft: common.BoolEnum.FALSE,
        struct_id: bridge.struct_id
      }
    });

    let repsGrantedAccess = structReps.filter(x =>
      helper.checkAccess({
        userAlias: user.alias,
        member: userMember,
        entity: x
      })
    );

    let reps = [
      ...draftReps
        .sort((a, b) =>
          Number(a.draft_created_ts) > Number(b.draft_created_ts)
            ? 1
            : Number(b.draft_created_ts) > Number(a.draft_created_ts)
            ? -1
            : 0
        )
        .reverse(),
      ...repsGrantedAccess.sort((a, b) =>
        a.title > b.title ? 1 : b.title > a.title ? -1 : 0
      )
    ];

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.struct_id,
      projectId: projectId
    });

    let apiMember = wrapper.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetMetricsResponsePayload = {
      needValidate: common.enumToBoolean(bridge.need_validate),
      struct: wrapper.wrapToApiStruct(struct),
      userMember: apiMember,
      metrics: metrics.map(x => wrapper.wrapToApiMetric({ metric: x })),
      reps: reps.map(x =>
        wrapper.wrapToApiRep({
          rep: x,
          member: apiMember,
          columns: [],
          timezone: undefined,
          timeSpec: undefined,
          timeRangeFraction: undefined,
          timeColumnsLimit: undefined,
          timeColumnsLength: undefined,
          isTimeColumnsLimitExceeded: false
        })
      )
    };

    return payload;
  }
}
