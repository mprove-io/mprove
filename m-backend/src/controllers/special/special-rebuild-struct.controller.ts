import { Body, Controller, Post } from '@nestjs/common';
import { RabbitService } from '../../services/rabbit.service';
import { makeRoutingKeyToDisk } from '../../helper/make-routing-key-to-disk';
import { api } from '../../barrels/api';

@Controller()
export class SpecialRebuildStructController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('specialRebuildStruct')
  async specialRebuildStruct(
    @Body() body: api.SpecialRebuildStructRequest
  ): Promise<any> {
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

      let getCatalogFilesResponse = await this.rabbitService.sendToDisk({
        routingKey: routingKey,
        message: getCatalogFilesRequest
      });

      let parsed: api.ToDiskGetCatalogFilesResponse = JSON.parse(
        getCatalogFilesResponse
      );

      // to blockml

      let rebuildStructRequest: api.ToBlockmlRebuildStructRequest = {
        info: {
          name: api.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct,
          traceId: traceId
        },
        payload: {
          structId: structId,
          weekStart: weekStart,
          files: parsed.payload.files.map((f: api.DiskCatalogFile) => {
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

      let rebuildStructResponse = await this.rabbitService.sendToBlockml({
        routingKey: api.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
        message: rebuildStructRequest
      });

      return (rebuildStructResponse as unknown) as api.ToBlockmlRebuildStructResponse;
    } catch (e) {
      return api.makeErrorResponse({ request: body, e: e });
    }
  }
}
