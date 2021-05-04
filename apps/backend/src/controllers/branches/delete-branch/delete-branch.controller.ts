import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class DeleteBranchController {
  constructor(
    private projectsService: ProjectsService,
    private branchesRepository: repositories.BranchesRepository,
    private rabbitService: RabbitService,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteBranch)
  async deleteBranch(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendDeleteBranchRequest)
    reqValid: apiToBackend.ToBackendDeleteBranchRequest
  ) {
    let { projectId, isRepoProd, branchId } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsEditor({
      memberId: user.user_id,
      projectId: projectId
    });

    if (branchId === common.BRANCH_MASTER) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_BRANCH_MASTER_CAN_NOT_BE_DELETED
      });
    }

    let toDiskDeleteBranchRequest: apiToDisk.ToDiskDeleteBranchRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteBranch,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteBranchResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskDeleteBranchRequest,
        checkIsOk: true
      }
    );

    await this.branchesRepository.delete({
      project_id: projectId,
      repo_id: repoId,
      branch_id: branchId
    });

    let payload = {};

    return payload;
  }
}
