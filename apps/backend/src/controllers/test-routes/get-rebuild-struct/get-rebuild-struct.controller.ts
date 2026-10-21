import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetRebuildStructRequestDto,
  ToBackendGetRebuildStructResponseDto
} from '#backend/controllers/test-routes/get-rebuild-struct/get-rebuild-struct.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { diskFilesToBlockmlFiles } from '#backend/functions/disk-files-to-blockml-files/disk-files-to-blockml-files';
import { TestRoutesGuard } from '#backend/guards/test-routes/test-routes.guard';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

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
    private envsService: EnvsService,
    private connectionsService: ConnectionsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetRebuildStruct' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'getRebuildStruct'>> {
    return Result.pipe(
      Result.succeed({
        orgId: body.input.orgId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branch: body.input.branch,
        envId: body.input.envId,
        overrideTimezone: body.input.overrideTimezone,
        isUseCache: body.input.isUseCache,
        cachedMproveConfig: body.input.cachedMproveConfig,
        cachedModels: body.input.cachedModels,
        cachedMetrics: body.input.cachedMetrics,
        traceId: body.traceId,
        structId: makeId()
      }),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('baseProject', v =>
        Result.succeed(
          this.tabService.projectTabToBaseProject({ project: v.project })
        )
      ),
      Result.bind('diskGetCatalogFilesOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'getCatalogFiles',
            traceId: v.traceId,
            input: {
              baseProject: v.baseProject,
              repoId: v.repoId,
              branch: v.branch
            }
          }
        })
      ),
      Result.bind('getApiEnvConnectionsWithFallbackOutput', v =>
        this.envsService.getApiEnvConnectionsWithFallback({
          projectId: v.projectId,
          envId: v.envId
        })
      ),
      Result.andThen(v =>
        this.rpcService.sendToBlockml({
          request: {
            operation: 'rebuildStruct',
            traceId: v.traceId,
            input: {
              structId: v.structId,
              projectId: v.projectId,
              mproveDir: v.diskGetCatalogFilesOutput.mproveDir,
              files: diskFilesToBlockmlFiles(v.diskGetCatalogFilesOutput.files),
              envId: v.envId,
              evs: v.getApiEnvConnectionsWithFallbackOutput.apiEnv
                .evsWithFallback,
              baseConnections:
                v.getApiEnvConnectionsWithFallbackOutput.connectionsWithFallback.map(
                  x =>
                    this.connectionsService.tabToBaseConnection({
                      connection: x
                    })
                ),
              selectedGivens: [],
              overrideTimezone: v.overrideTimezone,
              isUseCache: v.isUseCache,
              cachedMproveConfig: v.cachedMproveConfig,
              cachedModels: v.cachedModels,
              cachedMetrics: v.cachedMetrics
            }
          },
          orgId: v.orgId,
          repoId: v.repoId
        })
      )
    );
  }
}
