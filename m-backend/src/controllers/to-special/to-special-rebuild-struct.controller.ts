import { Body, Controller, Post } from '@nestjs/common';
import { RabbitService } from '../../services/rabbit.service';
import { makeRoutingKeyToDisk } from '../../helper/make-routing-key-to-disk';
import { api } from '../../barrels/api';
import { ServerError } from '../../api/_index';

@Controller()
export class ToSpecialRebuildStructController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post(api.ToSpecialRequestInfoNameEnum.ToSpecialRebuildStruct)
  async toSpecialRebuildStruct(
    @Body() body: api.ToSpecialRebuildStructRequest
  ): Promise<api.ToBlockmlRebuildStructResponse | api.ErrorResponse> {
    try {
      let requestValid = await api.transformValid({
        classType: api.ToSpecialRebuildStructRequest,
        object: body,
        errorMessage: api.ErEnum.M_BACKEND_WRONG_REQUEST_PARAMS
      });

      let { traceId } = requestValid.info;
      let {
        organizationId,
        projectId,
        repoId,
        branch,
        structId,
        weekStart,
        connections
      } = requestValid.payload;

      // to disk

      let routingKey = makeRoutingKeyToDisk({
        organizationId: organizationId,
        projectId: projectId
      });

      let getCatalogFilesRequest: api.ToDiskGetCatalogFilesRequest = {
        info: {
          name: api.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
          traceId: traceId
        },
        payload: {
          organizationId: organizationId,
          projectId: projectId,
          repoId: repoId,
          branch: branch
        }
      };

      let getCatalogFilesResponse = await this.rabbitService.sendToDisk<
        api.ToDiskGetCatalogFilesResponse
      >({
        routingKey: routingKey,
        message: getCatalogFilesRequest
      });

      if (
        getCatalogFilesResponse.info.status !== api.ResponseInfoStatusEnum.Ok
      ) {
        throw new ServerError({
          message: api.ErEnum.M_BACKEND_ERROR_RESPONSE_FROM_DISK,
          originalError: getCatalogFilesResponse.info.error
        });
      }

      // to blockml

      let rebuildStructRequest: api.ToBlockmlRebuildStructRequest = {
        info: {
          name: api.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct,
          traceId: traceId
        },
        payload: {
          structId: structId,
          organizationId: organizationId,
          projectId: projectId,
          weekStart: weekStart,
          files: getCatalogFilesResponse.payload.files.map(
            (f: api.DiskCatalogFile) => {
              let file: api.File = {
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

      let rebuildStructResponse = await this.rabbitService.sendToBlockml<
        api.ToBlockmlRebuildStructResponse
      >({
        routingKey: api.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
        message: rebuildStructRequest
      });

      if (rebuildStructResponse.info.status !== api.ResponseInfoStatusEnum.Ok) {
        throw new ServerError({
          message: api.ErEnum.M_BACKEND_ERROR_RESPONSE_FROM_BLOCKML,
          originalError: rebuildStructResponse.info.error
        });
      }

      return rebuildStructResponse;
    } catch (e) {
      return api.makeErrorResponse({ request: body, e: e });
    }
  }
}
