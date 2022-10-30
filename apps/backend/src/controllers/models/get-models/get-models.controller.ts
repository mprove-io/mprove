import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesRepository } from '~backend/models/store-repositories/branches.repository';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class GetModelsController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private branchesRepository: BranchesRepository,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModels)
  async getModels(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetModelsRequest)
    reqValid: apiToBackend.ToBackendGetModelsRequest
  ) {
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      filterByModelIds,
      addFields
    } = reqValid.payload;

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
      let payloadBranchDoesNotExist: apiToBackend.ToBackendGetModelsResponsePayload = {
        isBranchExist: false,
        userMember: undefined,
        struct: undefined,
        needValidate: undefined,
        models: []
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

      let modelsY = await this.modelsService.getModelsY({
        bridge: bridge,
        filterByModelIds: filterByModelIds,
        addFields: addFields
      });

      let struct = await this.structsService.getStructCheckExists({
        structId: bridge.struct_id,
        projectId: projectId
      });

      let apiMember = wrapper.wrapToApiMember(userMember);

      let payload: apiToBackend.ToBackendGetModelsResponsePayload = {
        isBranchExist: true,
        needValidate: common.enumToBoolean(bridge.need_validate),
        struct: wrapper.wrapToApiStruct(struct),
        userMember: apiMember,
        models: modelsY
          .map(model =>
            wrapper.wrapToApiModel({
              model: model,
              hasAccess: helper.checkAccess({
                userAlias: user.alias,
                member: userMember,
                vmd: model
              })
            })
          )
          .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0))
      };

      return payload;
    }
  }
}
