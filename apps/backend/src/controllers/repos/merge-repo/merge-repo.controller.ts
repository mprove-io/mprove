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
export class MergeRepoController {
  constructor(
    private projectsService: ProjectsService,
    private dbService: DbService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private blockmlService: BlockmlService,
    private branchesService: BranchesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendMergeRepo)
  async mergeRepo(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendMergeRepoRequest)
    reqValid: apiToBackend.ToBackendMergeRepoRequest
  ) {
    let { traceId } = reqValid.info;
    let {
      projectId,
      branchId,
      theirBranchId,
      isTheirBranchRemote
    } = reqValid.payload;

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

    let theirBranch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isTheirBranchRemote === true ? common.PROD_REPO_ID : user.user_id,
      branchId: theirBranchId
    });

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
        userAlias: user.alias,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
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

    let structId = common.makeId();

    await this.blockmlService.rebuildStruct({
      traceId,
      orgId: project.org_id,
      projectId,
      structId,
      diskFiles: diskResponse.payload.files
    });

    branch.struct_id = structId;

    await this.dbService.writeRecords({
      modify: true,
      records: {
        branches: [branch]
      }
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: structId
    });

    let payload: apiToBackend.ToBackendMergeRepoResponsePayload = {
      repo: diskResponse.payload.repo,
      struct: wrapper.wrapToApiStruct(struct)
    };

    return payload;
  }
}
