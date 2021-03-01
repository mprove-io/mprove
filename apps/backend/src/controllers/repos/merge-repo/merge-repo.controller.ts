import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { ReposService } from '~backend/services/repos.service';

@Controller()
export class MergeRepoController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private reposService: ReposService,
    private rabbitService: RabbitService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendMergeRepo)
  async mergeRepo(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendMergeRepoRequest)
    reqValid: apiToBackend.ToBackendMergeRepoRequest
  ) {
    let {
      projectId,
      repoId,
      branchId,
      theirBranchId,
      isTheirBranchRemote
    } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberExists({
      projectId: projectId,
      memberId: user.user_id
    });

    if (repoId !== common.PROD_REPO_ID) {
      await this.reposService.checkDevRepoId({
        userId: user.user_id,
        repoId: repoId
      });
    }

    let toDiskMergeRepoRequest: apiToDisk.ToDiskMergeRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskMergeRepo,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        theirBranch: theirBranchId,
        isTheirBranchRemote: isTheirBranchRemote,
        userAlias: user.alias
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskMergeRepoResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskMergeRepoRequest,
        checkIsOk: true
      }
    );

    let payload: apiToBackend.ToBackendMergeRepoResponsePayload = {
      repo: {
        currentBranchId: branchId,
        repoStatus: diskResponse.payload.repoStatus,
        conflicts: diskResponse.payload.conflicts,
        nodes: diskResponse.payload.nodes
      }
    };

    return payload;
  }
}
