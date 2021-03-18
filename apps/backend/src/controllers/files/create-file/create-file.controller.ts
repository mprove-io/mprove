import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class CreateFileController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rabbitService: RabbitService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateFile)
  async createFile(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateFileRequest)
    reqValid: apiToBackend.ToBackendCreateFileRequest
  ) {
    let { projectId, branchId, parentNodeId, fileName } = reqValid.payload;

    let repoId = user.alias;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsEditor({
      projectId: projectId,
      memberId: user.user_id
    });

    let toDiskCreateFileRequest: apiToDisk.ToDiskCreateFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        parentNodeId: parentNodeId,
        fileName: fileName,
        userAlias: user.alias
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateFileResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskCreateFileRequest,
        checkIsOk: true
      }
    );

    let payload: apiToBackend.ToBackendCreateFileResponsePayload = {
      repo: diskResponse.payload.repo
    };

    return payload;
  }
}
