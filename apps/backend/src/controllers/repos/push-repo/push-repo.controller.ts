import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class PushRepoController {
  constructor(
    private projectsService: ProjectsService,
    private dbService: DbService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private branchesService: BranchesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPushRepo)
  async pushRepo(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendPushRepoRequest)
    reqValid: apiToBackend.ToBackendPushRepoRequest
  ) {
    let { projectId, branchId } = reqValid.payload;

    let repoId = user.alias;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsEditor({
      projectId: projectId,
      memberId: user.user_id
    });

    let devBranch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: user.alias,
      branchId: branchId
    });

    let toDiskPushRepoRequest: apiToDisk.ToDiskPushRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskPushRepo,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        userAlias: user.alias
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskPushRepoResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskPushRepoRequest,
        checkIsOk: true
      }
    );

    let prodBranch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: common.PROD_REPO_ID,
      branchId: branchId
    });

    prodBranch.struct_id = devBranch.struct_id;

    await this.dbService.writeRecords({
      modify: true,
      records: {
        branches: [prodBranch]
      }
    });

    let payload: apiToBackend.ToBackendPushRepoResponsePayload = {
      repo: diskResponse.payload.repo
    };

    return payload;
  }
}