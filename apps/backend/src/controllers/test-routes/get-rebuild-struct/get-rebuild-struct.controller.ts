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
import { makeId } from '#common/functions/make-id';
import type { ToBlockmlRebuildStructRequest } from '#common/zod/blockml/routes/rebuild-struct/rebuild-struct-request';
import type { ToBlockmlRebuildStructOutput } from '#common/zod/blockml/routes/rebuild-struct/rebuild-struct-response';
import type { ToDiskGetCatalogFilesOutput } from '#common/zod/disk/routes/04-catalogs/get-catalog-files/get-catalog-files-response';

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

    let diskGetCatalogFilesOutput: ToDiskGetCatalogFilesOutput =
      await this.rpcService.sendToDiskUnwrapOutput({
        request: {
          operation: 'getCatalogFiles',
          traceId: body.info.traceId,
          input: {
            baseProject: baseProject,
            repoId: repoId,
            branch: branch
          }
        }
      });

    let { apiEnv, connectionsWithFallback } =
      await this.envsService.getApiEnvConnectionsWithFallback({
        projectId: projectId,
        envId: envId
      });

    // to blockml

    let rebuildStructRequest: ToBlockmlRebuildStructRequest = {
      operation: 'rebuildStruct',
      traceId: body.info.traceId,
      input: {
        structId: structId,
        projectId: projectId,
        mproveDir: diskGetCatalogFilesOutput.mproveDir,
        files: diskFilesToBlockmlFiles(diskGetCatalogFilesOutput.files),
        envId: envId,
        evs: apiEnv.evsWithFallback,
        baseConnections: connectionsWithFallback.map(x =>
          this.connectionsService.tabToBaseConnection({ connection: x })
        ),
        selectedGivens: [],
        overrideTimezone: overrideTimezone,
        isUseCache: isUseCache,
        cachedMproveConfig: cachedMproveConfig,
        cachedModels: cachedModels,
        cachedMetrics: cachedMetrics
      }
    };

    let output: ToBlockmlRebuildStructOutput =
      await this.rpcService.sendToBlockmlUnwrapOutput({
        request: rebuildStructRequest,
        orgId: orgId,
        repoId: repoId
      });

    return output;
  }
}
