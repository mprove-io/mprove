import { Controller, Post, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { RabbitService } from '~backend/services/rabbit.service';

@UseGuards(TestRoutesGuard)
@SkipJwtCheck()
@Controller()
export class RebuildStructSpecialController {
  constructor(private rabbitService: RabbitService) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRebuildStructSpecial)
  async rebuildStructSpecial(
    @ValidateRequest(apiToBackend.ToBackendRebuildStructSpecialRequest)
    reqValid: apiToBackend.ToBackendRebuildStructSpecialRequest
  ) {
    let {
      orgId,
      projectId,
      repoId,
      branch,
      structId,
      weekStart,
      connections
    } = reqValid.payload;

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
        weekStart: weekStart,
        files: getCatalogFilesResponse.payload.files.map(
          (f: apiToDisk.DiskCatalogFile) => {
            let file: apiToBlockml.File = {
              content: f.content,
              name: f.name,
              path: f.fileId
            };
            return file;
          }
        ),
        connections: connections
      }
    };

    let rebuildStructResponse = await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlRebuildStructResponse>(
      {
        routingKey: common.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
        message: rebuildStructRequest
      }
    );

    if (
      rebuildStructResponse.info.status !== common.ResponseInfoStatusEnum.Ok
    ) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_ERROR_RESPONSE_FROM_BLOCKML,
        originalError: rebuildStructResponse.info.error
      });
    }

    let payload = rebuildStructResponse.payload;

    return payload;
  }
}
