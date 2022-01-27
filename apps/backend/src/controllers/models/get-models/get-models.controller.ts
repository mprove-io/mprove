import { Controller, Post } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetModelsController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private modelsRepository: repositories.ModelsRepository
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
      filterByModelIds,
      addFields
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let selectAr: (
      | 'struct_id'
      | 'model_id'
      | 'connection_id'
      | 'file_path'
      | 'content'
      | 'access_users'
      | 'access_roles'
      | 'label'
      | 'gr'
      | 'hidden'
      | 'fields'
      | 'nodes'
      | 'description'
      | 'server_ts'
    )[] = [
      'struct_id',
      'model_id',
      'connection_id',
      'file_path',
      'access_users',
      'access_roles',
      'label',
      'gr',
      'hidden',
      'nodes',
      'description'
    ];

    let where = { struct_id: branch.struct_id };

    if (common.isDefined(filterByModelIds) && filterByModelIds.length > 0) {
      where = Object.assign(where, {
        model_id: In(filterByModelIds)
      });
    }

    if (addFields === true) {
      selectAr.push('fields');
    }

    let models = await this.modelsRepository.find({
      select: selectAr,
      where: where
    });

    let payload: apiToBackend.ToBackendGetModelsResponsePayload = {
      models: models
        .map(model =>
          wrapper.wrapToApiModel({
            model: model,
            hasAccess: helper.checkAccess({
              userAlias: user.alias,
              member: member,
              vmd: model,
              checkExplorer: true
            })
          })
        )
        .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0))
    };

    return payload;
  }
}
