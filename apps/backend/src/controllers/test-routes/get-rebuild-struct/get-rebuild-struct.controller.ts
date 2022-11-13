import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, SkipJwtCheck } from '~backend/decorators/_index';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@UseGuards(TestRoutesGuard)
@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class GetRebuildStructController {
  constructor(
    private rabbitService: RabbitService,
    private connectionsRepository: repositories.ConnectionsRepository,
    private evsRepository: repositories.EvsRepository,
    private projectsService: ProjectsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRebuildStruct)
  async getRebuildStruct(
    @AttachUser() user: entities.UserEntity,
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
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
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

    let connections = await this.connectionsRepository.find({
      where: {
        project_id: projectId,
        env_id: envId
      }
    });

    let evs = await this.evsRepository.find({
      where: {
        project_id: projectId,
        env_id: envId
      }
    });

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
        evs: evs.map(x => wrapper.wrapToApiEv(x)),
        projectId: projectId,
        mproveDir: getCatalogFilesResponse.payload.mproveDir,
        files: helper.diskFilesToBlockmlFiles(
          getCatalogFilesResponse.payload.files
        ),
        connections: connections.map(x => ({
          connectionId: x.connection_id,
          type: x.type,
          bigqueryProject: x.bigquery_project
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
