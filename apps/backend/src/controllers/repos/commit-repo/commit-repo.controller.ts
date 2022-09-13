import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class CommitRepoController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private branchesService: BranchesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCommitRepo)
  async commitRepo(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCommitRepoRequest)
    reqValid: apiToBackend.ToBackendCommitRepoRequest
  ) {
    let { projectId, branchId, commitMessage } = reqValid.payload;

    let repoId = user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsEditor({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: user.user_id,
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
        commitMessage: commitMessage,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
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

    let struct = await this.structsService.getStructCheckExists({
      structId: branch.struct_id
    });

    let payload: apiToBackend.ToBackendCommitRepoResponsePayload = {
      repo: diskResponse.payload.repo,
      struct: wrapper.wrapToApiStruct(struct)
    };

    return payload;
  }
}
