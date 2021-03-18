import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class CommitRepoController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private branchesService: BranchesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCommitRepo)
  async commitRepo(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCommitRepoRequest)
    reqValid: apiToBackend.ToBackendCommitRepoRequest
  ) {
    let { projectId, branchId, commitMessage } = reqValid.payload;

    let repoId = user.alias;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsEditor({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: user.alias,
      branchId: branchId
    });

    let toDiskCommitRepoRequest: apiToDisk.ToDiskCommitRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        userAlias: user.alias,
        commitMessage: commitMessage
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskCommitRepoResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskCommitRepoRequest,
        checkIsOk: true
      }
    );

    let payload: apiToBackend.ToBackendCommitRepoResponsePayload = {
      repo: diskResponse.payload.repo
    };

    return payload;
  }
}
