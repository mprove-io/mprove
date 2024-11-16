import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser, SkipJwtCheck } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { evsTable } from '~backend/drizzle/postgres/schema/evs';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(TestRoutesGuard)
@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class GetRebuildStructController {
  constructor(
    private rabbitService: RabbitService,
    private projectsService: ProjectsService,
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRebuildStruct)
  async getRebuildStruct(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetRebuildStructRequest = request.body;

    let { orgId, projectId, repoId, branch, envId } = reqValid.payload;

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

    let connections = await this.db.drizzle.query.connectionsTable.findMany({
      where: and(
        eq(connectionsTable.projectId, projectId),
        eq(connectionsTable.envId, envId)
      )
    });

    // let connections = await this.connectionsRepository.find({
    //   where: {
    //     project_id: projectId,
    //     env_id: envId
    //   }
    // });

    let evs = await this.db.drizzle.query.evsTable.findMany({
      where: and(eq(evsTable.projectId, projectId), eq(evsTable.envId, envId))
    });

    // let evs = await this.evsRepository.find({
    //   where: {
    //     project_id: projectId,
    //     env_id: envId
    //   }
    // });

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
        evs: evs.map(x => this.wrapToApiService.wrapToApiEv(x)),
        projectId: projectId,
        mproveDir: getCatalogFilesResponse.payload.mproveDir,
        files: helper.diskFilesToBlockmlFiles(
          getCatalogFilesResponse.payload.files
        ),
        connections: connections.map(x => ({
          connectionId: x.connectionId,
          type: x.type,
          bigqueryProject: x.bigqueryProject
        }))
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
