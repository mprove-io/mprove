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
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetVizsController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private modelsRepository: repositories.ModelsRepository,
    private projectsService: ProjectsService,
    private vizsRepository: repositories.VizsRepository,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetVizs)
  async getVizs(@AttachUser() user: entities.UserEntity, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendGetVizsRequest = request.body;

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

    let vizs = await this.vizsRepository.find({
      where: {
        struct_id: bridge.struct_id
      }
    });

    let vizsGrantedAccess = vizs.filter(x =>
      helper.checkAccess({
        userAlias: user.alias,
        member: userMember,
        entity: x
      })
    );

    let models = await this.modelsRepository.find({
      select: [
        'model_id',
        'access_users',
        'access_roles',
        'hidden',
        'connection_id'
      ],
      where: { struct_id: bridge.struct_id }
    });

    let modelsY = await this.modelsService.getModelsY({
      bridge: bridge,
      filterByModelIds: undefined,
      addFields: false
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.struct_id,
      projectId: projectId
    });

    let apiMember = wrapper.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetVizsResponsePayload = {
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
              entity: model
            })
          })
        )
        .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0)),
      vizs: vizsGrantedAccess.map(x =>
        wrapper.wrapToApiViz({
          viz: x,
          mconfigs: [],
          queries: [],
          member: wrapper.wrapToApiMember(userMember),
          models: models.map(model =>
            wrapper.wrapToApiModel({
              model: model,
              hasAccess: helper.checkAccess({
                userAlias: user.alias,
                member: userMember,
                entity: model
              })
            })
          ),
          isAddMconfigAndQuery: false
        })
      )
    };

    return payload;
  }
}
