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
export class RevertRepoToLastCommitController {
  constructor(
    private projectsService: ProjectsService,
    private dbService: DbService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private branchesService: BranchesService
  ) {}

  @Post(
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRevertRepoToLastCommit
  )
  async revertRepoToLastCommit(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendRevertRepoToLastCommitRequest)
    reqValid: apiToBackend.ToBackendRevertRepoToLastCommitRequest
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

    let toDiskRevertRepoToLastCommitRequest: apiToDisk.ToDiskRevertRepoToLastCommitRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskRevertRepoToLastCommitResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskRevertRepoToLastCommitRequest,
        checkIsOk: true
      }
    );

    let prodBranch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: common.PROD_REPO_ID,
      branchId: branchId
    });

    devBranch.struct_id = prodBranch.struct_id;

    await this.dbService.writeRecords({
      modify: true,
      records: {
        branches: [devBranch]
      }
    });

    let payload: apiToBackend.ToBackendRevertRepoToLastCommitResponsePayload = {
      repo: diskResponse.payload.repo
    };

    return payload;
  }
}
