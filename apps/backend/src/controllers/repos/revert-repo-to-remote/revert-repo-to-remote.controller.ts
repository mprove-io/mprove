import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class RevertRepoToRemoteController {
  constructor(
    private projectsService: ProjectsService,
    private dbService: DbService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private blockmlService: BlockmlService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRevertRepoToRemote)
  async revertRepoToRemote(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendRevertRepoToRemoteRequest)
    reqValid: apiToBackend.ToBackendRevertRepoToRemoteRequest
  ) {
    let { traceId } = reqValid.info;
    let { projectId, isRepoProd, branchId } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsEditor({
      projectId: projectId,
      memberId: user.user_id
    });

    let devBranch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let toDiskRevertRepoToRemoteRequest: apiToDisk.ToDiskRevertRepoToRemoteRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToRemote,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskRevertRepoToRemoteResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskRevertRepoToRemoteRequest,
        checkIsOk: true
      }
    );

    let structId = common.makeId();

    await this.blockmlService.rebuildStruct({
      traceId,
      orgId: project.org_id,
      projectId,
      structId,
      diskFiles: diskResponse.payload.files
    });

    devBranch.struct_id = structId;

    await this.dbService.writeRecords({
      modify: true,
      records: {
        branches: [devBranch]
      }
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: structId
    });

    let payload: apiToBackend.ToBackendRevertRepoToRemoteResponsePayload = {
      repo: diskResponse.payload.repo,
      struct: wrapper.wrapToApiStruct(struct)
    };

    return payload;
  }
}
