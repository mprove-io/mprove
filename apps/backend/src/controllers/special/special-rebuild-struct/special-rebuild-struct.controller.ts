import { Controller, Post, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@UseGuards(TestRoutesGuard)
@Controller()
export class SpecialRebuildStructController {
  constructor(
    private rabbitService: RabbitService,
    private projectsService: ProjectsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSpecialRebuildStruct)
  async specialRebuildStruct(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSpecialRebuildStructRequest)
    reqValid: apiToBackend.ToBackendSpecialRebuildStructRequest
  ) {
    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let {
      orgId,
      projectId,
      envId,
      isRepoProd,
      branch,
      structId,
      connections
    } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    // to disk

    let getCatalogFilesRequest: apiToDisk.ToDiskGetCatalogFilesRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branch,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let getCatalogFilesResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskGetCatalogFilesResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: orgId,
          projectId: projectId
        }),
        message: getCatalogFilesRequest,
        checkIsOk: true
      }
    );

    // to blockml

    let rebuildStructRequest: apiToBlockml.ToBlockmlRebuildStructRequest = {
      info: {
        name: apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct,
        traceId: reqValid.info.traceId
      },
      payload: {
        structId: structId,
        orgId: orgId,
        envId: envId,
        projectId: projectId,
        files: helper.diskFilesToBlockmlFiles(
          getCatalogFilesResponse.payload.files
        ),
        connections: connections
      }
    };

    let rebuildStructResponse = await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlRebuildStructResponse>(
      {
        routingKey: common.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
        message: rebuildStructRequest,
        checkIsOk: true
      }
    );

    let payload = rebuildStructResponse.payload;

    return payload;
  }
}
