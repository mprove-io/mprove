import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { diskFilesToBlockmlFiles } from '~backend/functions/disk-files-to-blockml-files';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ConnectionsService } from '~backend/services/db/connections.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { RpcService } from '~backend/services/rpc.service';
import { TabService } from '~backend/services/tab.service';
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

// ToBackendGetRebuildStructRequest is for tests only
// backend use apps/backend/src/services/blockml.service.ts -> rebuildStruct
@SkipJwtCheck()
@SkipThrottle()
@UseGuards(TestRoutesGuard, ValidateRequestGuard)
@Controller()
export class GetRebuildStructController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private connectionsService: ConnectionsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetRebuildStruct)
  async getRebuildStruct(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetRebuildStructRequest = request.body;

    let {
      orgId,
      projectId,
      repoId,
      branch,
      envId,
      overrideTimezone,
      isUseCache,
      cachedMproveConfig,
      cachedModels,
      cachedMetrics
    } = reqValid.payload;

    let structId = makeId();

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    // to disk

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskGetCatalogFilesRequest: ToDiskGetCatalogFilesRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: orgId,
        baseProject: baseProject,
        repoId: repoId,
        branch: branch
      }
    };

    let getCatalogFilesResponse =
      await this.rpcService.sendToDisk<ToDiskGetCatalogFilesResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: orgId,
          projectId: projectId
        }),
        message: toDiskGetCatalogFilesRequest,
        checkIsOk: true
      });

    let { apiEnv, connectionsWithFallback } =
      await this.envsService.getApiEnvConnectionsWithFallback({
        projectId: projectId,
        envId: envId
      });

    // to blockml

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
        baseConnections: connectionsWithFallback.map(x =>
          this.connectionsService.tabToBaseConnection({ connection: x })
        ),
        overrideTimezone: overrideTimezone,
        isUseCache: isUseCache,
        cachedMproveConfig: cachedMproveConfig,
        cachedModels: cachedModels,
        cachedMetrics: cachedMetrics
      }
    };

    let rebuildStructResponse =
      await this.rpcService.sendToBlockml<ToBlockmlRebuildStructResponse>({
        message: rebuildStructRequest,
        checkIsOk: true
      });

    let payload = rebuildStructResponse.payload;

    return payload;
  }
}
