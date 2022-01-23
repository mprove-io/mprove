import { Controller, Post } from '@nestjs/common';
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
export class GetDashboardsController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private modelsRepository: repositories.ModelsRepository,
    private dashboardsRepository: repositories.DashboardsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboards)
  async getDashboards(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetDashboardsRequest)
    reqValid: apiToBackend.ToBackendGetDashboardsRequest
  ) {
    let { projectId, isRepoProd, branchId } = reqValid.payload;

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

    let dashboards = await this.dashboardsRepository.find({
      select: [
        'dashboard_id',
        'file_path',
        'access_users',
        'access_roles',
        'title',
        'gr',
        'hidden',
        'fields',
        'reports',
        'description'
      ],
      where: { struct_id: branch.struct_id, temp: common.BoolEnum.FALSE }
    });

    let dashboardsGrantedAccess = dashboards.filter(x =>
      helper.checkAccess({
        userAlias: user.alias,
        member: member,
        vmd: x
      })
    );

    let models = await this.modelsRepository.find({
      select: ['model_id', 'access_users', 'access_roles', 'hidden'],
      where: { struct_id: branch.struct_id }
    });

    let payload: apiToBackend.ToBackendGetDashboardsResponsePayload = {
      dashboards: dashboardsGrantedAccess.map(x =>
        wrapper.wrapToApiDashboard({
          dashboard: x,
          mconfigs: [],
          queries: [],
          member: wrapper.wrapToApiMember(member),
          models: models.map(model =>
            wrapper.wrapToApiModel({
              model: model,
              hasAccess: helper.checkAccess({
                userAlias: user.alias,
                member: member,
                vmd: model,
                checkExplorer: true
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
