import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser, SkipJwtCheck } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
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
  async getRebuildStruct(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetRebuildStructRequest = request.body;

    let { orgId, projectId, repoId, branch, envId, overrideTimezone } =
      reqValid.payload;

    let structId = common.makeId();

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
          routingKey: helper.makeRoutingKeyToDisk({
            orgId: orgId,
            projectId: projectId
          }),
          message: getCatalogFilesRequest,
          checkIsOk: true
        }
      );

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: projectId
    });

    let apiEnv = apiEnvs.find(x => x.envId === envId);

    let connectionsEntsWithFallback =
      await this.db.drizzle.query.connectionsTable.findMany({
        where: and(
          eq(connectionsTable.projectId, projectId),
          inArray(
            connectionsTable.connectionId,
            apiEnv.envConnectionIdsWithFallback
          )
        )
      });

    let connectionsWithFallback = connectionsEntsWithFallback.map(x => ({
      connectionId: x.connectionId,
      type: x.type,
      googleCloudProject: x.googleCloudProject
    }));

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
        mproveDir: getCatalogFilesResponse.payload.mproveDir,
        files: helper.diskFilesToBlockmlFiles(
          getCatalogFilesResponse.payload.files
        ),
        envId: envId,
        evs: apiEnv.evsWithFallback,
        connections: connectionsWithFallback,
        overrideTimezone: overrideTimezone
      }
    };

    let rebuildStructResponse =
      await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlRebuildStructResponse>(
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
