import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { diskFilesToBlockmlFiles } from '~backend/functions/disk-files-to-blockml-files';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EnvsService } from '~backend/services/envs.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { RabbitBlockmlRoutingEnum } from '~common/enums/rabbit-blockml-routing-keys.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToBlockmlRequestInfoNameEnum } from '~common/enums/to/to-blockml-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { ToBackendGetRebuildStructRequest } from '~common/interfaces/to-backend/test-routes/to-backend-get-rebuild-struct';
import {
  ToBlockmlRebuildStructRequest,
  ToBlockmlRebuildStructResponse
} from '~common/interfaces/to-blockml/api/to-blockml-rebuild-struct';
import {
  ToDiskGetCatalogFilesRequest,
  ToDiskGetCatalogFilesResponse
} from '~common/interfaces/to-disk/04-catalogs/to-disk-get-catalog-files';

@UseGuards(TestRoutesGuard)
@SkipJwtCheck()
@SkipThrottle()
@UseGuards(ValidateRequestGuard)
@Controller()
export class GetRebuildStructController {
  constructor(
    private rabbitService: RabbitService,
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetRebuildStruct)
  async getRebuildStruct(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetRebuildStructRequest = request.body;

    let { orgId, projectId, repoId, branch, envId, overrideTimezone } =
      reqValid.payload;

    let structId = makeId();

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    // to disk

    let getCatalogFilesRequest: ToDiskGetCatalogFilesRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
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
      await this.rabbitService.sendToDisk<ToDiskGetCatalogFilesResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: orgId,
          projectId: projectId
        }),
        message: getCatalogFilesRequest,
        checkIsOk: true
      });

    let { apiEnv, connectionsWithFallback } =
      await this.envsService.getApiEnvConnectionsWithFallback({
        projectId: projectId,
        envId: envId
      });

    // to blockml

    // console.log('connectionsWithFallback');
    // console.log(connectionsWithFallback);

    let rebuildStructRequest: ToBlockmlRebuildStructRequest = {
      info: {
        name: ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct,
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
      await this.rabbitService.sendToBlockml<ToBlockmlRebuildStructResponse>({
        routingKey: RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
        message: rebuildStructRequest,
        checkIsOk: true
      });

    let payload = rebuildStructResponse.payload;

    return payload;
  }
}
