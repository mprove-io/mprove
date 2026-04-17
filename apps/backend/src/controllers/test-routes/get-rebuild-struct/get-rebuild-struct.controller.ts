import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ToBackendGetRebuildStructRequestDto,
  ToBackendGetRebuildStructResponseDto
} from '#backend/controllers/test-routes/get-rebuild-struct/get-rebuild-struct.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { diskFilesToBlockmlFiles } from '#backend/functions/disk-files-to-blockml-files';
import { TestRoutesGuard } from '#backend/guards/test-routes.guard';
import { ConnectionsService } from '#backend/services/db/connections.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBlockmlRequestInfoNameEnum } from '#common/enums/to/to-blockml-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type {
  ToBlockmlRebuildStructRequest,
  ToBlockmlRebuildStructResponse
} from '#common/zod/to-blockml/api/to-blockml-rebuild-struct';
import type {
  ToDiskGetCatalogFilesRequest,
  ToDiskGetCatalogFilesResponse
} from '#common/zod/to-disk/04-catalogs/to-disk-get-catalog-files';

@ApiTags('TestRoutes')
// ToBackendGetRebuildStructRequest is for tests only
// backend use apps/backend/src/services/blockml.service.ts -> rebuildStruct
@SkipJwtCheck()
@SkipThrottle()
@UseGuards(TestRoutesGuard)
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
  @ApiOperation({
    summary: 'GetRebuildStruct',
    description: 'Rebuild a project struct for tests'
  })
  @ApiOkResponse({
    type: ToBackendGetRebuildStructResponseDto
  })
  async getRebuildStruct(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetRebuildStructRequestDto
  ) {
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
    } = body.payload;

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
        traceId: body.info.traceId
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
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
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
        traceId: body.info.traceId
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
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        message: rebuildStructRequest,
        checkIsOk: true
      });

    let payload = rebuildStructResponse.payload;

    return payload;
  }
}
