import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class GetFileController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private rabbitService: RabbitService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetFile)
  async getFile(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetFileRequest)
    reqValid: apiToBackend.ToBackendGetFileRequest
  ) {
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      fileNodeId
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let toDiskGetFileRequest: apiToDisk.ToDiskGetFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        fileNodeId: fileNodeId,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskGetFileResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskGetFileRequest,
        checkIsOk: true
      }
    );

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? common.PROD_REPO_ID : user.user_id,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExists({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.project_id,
      repoId: branch.repo_id,
      branchId: branch.branch_id,
      envId: envId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.struct_id,
      projectId: projectId
    });

    let payload: apiToBackend.ToBackendGetFileResponsePayload = {
      repo: diskResponse.payload.repo,
      content: diskResponse.payload.content,
      struct: wrapper.wrapToApiStruct(struct),
      needValidate: common.enumToBoolean(bridge.need_validate)
    };

    return payload;
  }
}
