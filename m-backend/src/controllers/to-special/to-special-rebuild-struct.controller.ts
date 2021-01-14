import { Body, Controller, Post } from '@nestjs/common';
import { RabbitService } from '../../services/rabbit.service';
import { makeRoutingKeyToDisk } from '../../helper/make-routing-key-to-disk';
import { api } from '../../barrels/api';

@Controller()
export class ToSpecialRebuildStructController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('toSpecialRebuildStruct')
  async toSpecialRebuildStruct(
    @Body() body: api.ToSpecialRebuildStructRequest
  ): Promise<api.ToBlockmlRebuildStructResponse | api.ErrorResponse> {
    try {
      let { traceId } = body.info;
      let {
        organizationId,
        projectId,
        repoId,
        branch,
        structId,
        weekStart,
        connections
      } = body.payload;

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

      let resp1 = await this.rabbitService.sendToDisk<
        api.ToDiskGetCatalogFilesResponse
      >({
        routingKey: routingKey,
        message: getCatalogFilesRequest
      });

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
          files: resp1.payload.files.map((f: api.DiskCatalogFile) => {
            let file: api.File = {
              content: f.content,
              name: f.name,
              path: f.fileId
            };
            return file;
          }),
          connections: connections
        }
      };

      let resp2 = await this.rabbitService.sendToBlockml<
        api.ToBlockmlRebuildStructResponse
      >({
        routingKey: api.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
        message: rebuildStructRequest
      });

      return resp2;
    } catch (e) {
      return api.makeErrorResponse({ request: body, e: e });
    }
  }
}
