import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class RevertRepoToProductionController {
  constructor(
    private projectsService: ProjectsService,
    private dbService: DbService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private branchesService: BranchesService
  ) {}

  @Post(
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRevertRepoToProduction
  )
  async revertRepoToProduction(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendRevertRepoToProductionRequest)
    reqValid: apiToBackend.ToBackendRevertRepoToProductionRequest
  ) {
    let { projectId, branchId } = reqValid.payload;

    let repoId = user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsEditor({
      projectId: projectId,
      memberId: user.user_id
    });

    let devBranch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: user.user_id,
      branchId: branchId
    });

    let toDiskRevertRepoToProductionRequest: apiToDisk.ToDiskRevertRepoToProductionRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToProduction,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskRevertRepoToProductionResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskRevertRepoToProductionRequest,
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

    let struct = await this.structsService.getStructCheckExists({
      structId: devBranch.struct_id
    });

    let payload: apiToBackend.ToBackendRevertRepoToProductionResponsePayload = {
      repo: diskResponse.payload.repo,
      struct: wrapper.wrapToApiStruct(struct)
    };

    return payload;
  }
}