import { Controller, Post, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { RabbitService } from '~backend/services/rabbit.service';

@UseGuards(TestRoutesGuard)
@Controller()
export class RebuildStructSpecialController {
  constructor(private rabbitService: RabbitService) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRebuildStructSpecial)
  async rebuildStructSpecial(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendRebuildStructSpecialRequest)
    reqValid: apiToBackend.ToBackendRebuildStructSpecialRequest
  ) {
    let {
      orgId,
      projectId,
      isRepoProd,
      branch,
      structId,
      connections
    } = reqValid.payload;

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
        branch: branch
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
