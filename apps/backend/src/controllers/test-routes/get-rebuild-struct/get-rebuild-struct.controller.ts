import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';

import { apiToBlockml } from '~backend/barrels/api-to-blockml';

import { AttachUser, SkipJwtCheck } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EnvsService } from '~backend/services/envs.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@UseGuards(TestRoutesGuard)
@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class GetRebuildStructController {
  constructor(
    private rabbitService: RabbitService,
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRebuildStruct)
  async getRebuildStruct(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendGetRebuildStructRequest = request.body;

    let { orgId, projectId, repoId, branch, envId, overrideTimezone } =
      reqValid.payload;

    let structId = makeId();

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

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
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
      }
    };

    let getCatalogFilesResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskGetCatalogFilesResponse>(
        {
          routingKey: makeRoutingKeyToDisk({
            orgId: orgId,
            projectId: projectId
          }),
          message: getCatalogFilesRequest,
          checkIsOk: true
        }
      );

    let { apiEnv, connectionsWithFallback } =
      await this.envsService.getApiEnvConnectionsWithFallback({
        projectId: projectId,
        envId: envId
      });

    // to blockml

    // console.log('connectionsWithFallback');
    // console.log(connectionsWithFallback);

    let rebuildStructRequest: apiToBlockml.ToBlockmlRebuildStructRequest = {
      info: {
        name: apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct,
        traceId: reqValid.info.traceId
      },
      payload: {
        structId: structId,
        projectId: projectId,
        mproveDir: getCatalogFilesResponse.payload.mproveDir,
        files: diskFilesToBlockmlFiles(getCatalogFilesResponse.payload.files),
        envId: envId,
        evs: apiEnv.evsWithFallback,
        connections: connectionsWithFallback,
        overrideTimezone: overrideTimezone
      }
    };

    let rebuildStructResponse =
      await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlRebuildStructResponse>(
        {
          routingKey: RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
          message: rebuildStructRequest,
          checkIsOk: true
        }
      );

    let payload = rebuildStructResponse.payload;

    return payload;
  }
}
