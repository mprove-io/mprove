import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { makeRoutingKeyToDisk } from '~backend/helper/make-routing-key-to-disk';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class RebuildStructSpecialController {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRebuildStructSpecial)
  async rebuildStructSpecial(@Body() body) {
    try {
      let reqValid = await common.transformValid({
        classType: apiToBackend.ToBackendRebuildStructSpecialRequest,
        object: body,
        errorMessage: apiToBackend.ErEnum.BACKEND_WRONG_REQUEST_PARAMS
      });

      let {
        organizationId,
        projectId,
        repoId,
        branch,
        structId,
        weekStart,
        connections
      } = reqValid.payload;

      // to disk

      let routingKey = makeRoutingKeyToDisk({
        organizationId: organizationId,
        projectId: projectId
      });

      let getCatalogFilesRequest: apiToDisk.ToDiskGetCatalogFilesRequest = {
        info: {
          name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
          traceId: reqValid.info.traceId
        },
        payload: {
          organizationId: organizationId,
          projectId: projectId,
          repoId: repoId,
          branch: branch
        }
      };

      let getCatalogFilesResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskGetCatalogFilesResponse>(
        {
          routingKey: routingKey,
          message: getCatalogFilesRequest
        }
      );

      if (
        getCatalogFilesResponse.info.status !== common.ResponseInfoStatusEnum.Ok
      ) {
        throw new common.ServerError({
          message: apiToBackend.ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK,
          originalError: getCatalogFilesResponse.info.error
        });
      }

      // to blockml

      let rebuildStructRequest: apiToBlockml.ToBlockmlRebuildStructRequest = {
        info: {
          name:
            apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct,
          traceId: reqValid.info.traceId
        },
        payload: {
          structId: structId,
          organizationId: organizationId,
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

      return common.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
