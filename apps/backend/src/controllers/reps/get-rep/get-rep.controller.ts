import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DocService } from '~backend/services/doc.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetRepController {
  constructor(
    private membersService: MembersService,
    private docService: DocService,
    private projectsService: ProjectsService,
    private repsRepository: repositories.RepsRepository,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRep)
  async getModels(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetRepRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      repId,
      draft,
      withData,
      timeRangeFraction,
      timeSpec,
      timezone
    } = reqValid.payload;

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

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.struct_id,
      projectId: projectId
    });

    let emptyRep: entities.RepEntity = {
      struct_id: struct.struct_id,
      rep_id: repId,
      creator_id: undefined,
      draft: common.BoolEnum.TRUE,
      file_path: undefined,
      title: repId,
      rows: [],
      server_ts: undefined
    };

    let rep =
      repId === common.EMPTY
        ? emptyRep
        : draft === true
        ? await this.repsRepository.findOne({
            where: {
              rep_id: repId,
              draft: common.BoolEnum.TRUE,
              creator_id: user.user_id
            }
          })
        : await this.repsRepository.findOne({
            where: {
              rep_id: repId,
              draft: common.BoolEnum.FALSE,
              struct_id: bridge.struct_id
            }
          });

    let { columns, isTimeColumnsLimitExceeded, timeColumnsLimit } =
      await this.blockmlService.getTimeColumns({
        traceId: traceId,
        timeSpec: timeSpec,
        timeRangeFraction: timeRangeFraction,
        projectWeekStart: struct.week_start
      });

    let repApi = wrapper.wrapToApiRep({
      rep: rep,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      timeColumnsLimit: timeColumnsLimit,
      timeColumnsLength: columns.length,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded
    });

    repApi.columns = columns;

    if (withData === true) {
      repApi = await this.docService.getData({ rep: repApi });
    }

    let apiMember = wrapper.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetRepResponsePayload = {
      needValidate: common.enumToBoolean(bridge.need_validate),
      struct: wrapper.wrapToApiStruct(struct),
      userMember: apiMember,
      rep: repApi
    };

    return payload;
  }
}
