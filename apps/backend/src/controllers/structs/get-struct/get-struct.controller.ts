import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesRepository } from '~backend/models/store-repositories/branches.repository';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetStructController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private structsService: StructsService,
    private bridgesService: BridgesService,
    private branchesRepository: BranchesRepository,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetStruct)
  async getStruct(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetStructRequest = request.body;

    let { projectId, isRepoProd, branchId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesRepository.findOne({
      where: {
        project_id: projectId,
        repo_id: isRepoProd === true ? common.PROD_REPO_ID : user.user_id,
        branch_id: branchId
      }
    });

    if (common.isUndefined(branch)) {
      let payloadBranchDoesNotExist: apiToBackend.ToBackendGetStructResponsePayload =
        {
          isBranchExist: false,
          userMember: undefined,
          needValidate: undefined,
          struct: undefined
        };

      return payloadBranchDoesNotExist;
    } else {
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

      let apiMember = wrapper.wrapToApiMember(userMember);

      let payloadBranchExist: apiToBackend.ToBackendGetStructResponsePayload = {
        isBranchExist: true,
        needValidate: common.enumToBoolean(bridge.need_validate),
        struct: wrapper.wrapToApiStruct(struct),
        userMember: apiMember
      };

      return payloadBranchExist;
    }
  }
}
