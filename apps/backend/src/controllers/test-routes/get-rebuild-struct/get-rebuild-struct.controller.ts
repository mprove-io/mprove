import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  ToBackendGetRebuildStructRequestDto,
  ToBackendGetRebuildStructResponseDto
} from '#backend/controllers/test-routes/get-rebuild-struct/get-rebuild-struct.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { diskFilesToBlockmlFiles } from '#backend/functions/disk-files-to-blockml-files/disk-files-to-blockml-files';
import { TestRoutesGuard } from '#backend/guards/test-routes/test-routes.guard';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import {
  EnvsService,
  type GetApiEnvConnectionsWithFallbackOutput
} from '#backend/services/db/envs/envs.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { makeId } from '#common/functions/make-id/make-id';
import type { GetApiEnvConnectionsWithFallbackError } from '#common/types/backend/function-errors/get-api-env-connections-with-fallback-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { SendToBlockmlError } from '#common/types/backend/function-errors/send-to-blockml-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetRebuildStructOutput } from '#common/types/backend/routes/test-routes/get-rebuild-struct/get-rebuild-struct-output';
import type { ToDiskGetCatalogFilesOutput } from '#common/types/disk/routes/catalogs/get-catalog-files/get-catalog-files-output';

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
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.projectsService.getProjectCheckExists({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'baseProject',
        (v): Result.Result<BaseProject, never> =>
          Result.succeed(
            this.tabService.projectTabToBaseProject({ project: v.project })
          )
      ),
      Result.bind(
        'diskGetCatalogFilesOutput',
        (v): Result.ResultAsync<ToDiskGetCatalogFilesOutput, SendToDiskError> =>
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
      Result.bind(
        'getApiEnvConnectionsWithFallbackOutput',
        (
          v
        ): Result.ResultAsync<
          GetApiEnvConnectionsWithFallbackOutput,
          GetApiEnvConnectionsWithFallbackError
        > =>
          this.envsService.getApiEnvConnectionsWithFallback({
            projectId: v.projectId,
            envId: v.envId
          })
      ),
      Result.andThen(
        (
          v
        ): Result.ResultAsync<
          ToBackendGetRebuildStructOutput,
          SendToBlockmlError
        > =>
          this.rpcService.sendToBlockml({
            request: {
              operation: 'rebuildStruct',
              traceId: v.traceId,
              input: {
                structId: v.structId,
                projectId: v.projectId,
                mproveDir: v.diskGetCatalogFilesOutput.mproveDir,
                files: diskFilesToBlockmlFiles(
                  v.diskGetCatalogFilesOutput.files
                ),
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
