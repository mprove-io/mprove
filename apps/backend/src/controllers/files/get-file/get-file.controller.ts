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

@Controller()
export class GetFileController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rabbitService: RabbitService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetFile)
  async getFile(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetFileRequest)
    reqValid: apiToBackend.ToBackendGetFileRequest
  ) {
    let { projectId, isRepoProd, branchId, fileNodeId } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckExists({
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
        fileNodeId: fileNodeId
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

    let payload: apiToBackend.ToBackendGetFileResponsePayload = {
      repo: diskResponse.payload.repo,
      content: diskResponse.payload.content
    };

    return payload;
  }
}
