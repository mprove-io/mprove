import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteProjectRequestDto,
  ToBackendDeleteProjectResponseDto
} from '#backend/controllers/projects/delete-project/delete-project.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { envsTable } from '#backend/drizzle/postgres/schema/envs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteProjectOutput } from '#common/types/backend/routes/projects/delete-project/delete-project-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteProjectController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendDeleteProject' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteProject',
    description: 'Delete a project and all its related data'
  })
  @ApiOkResponse({
    type: ToBackendDeleteProjectResponseDto
  })
  deleteProject(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteProjectRequestDto
  ): Promise<BackendResultForOperation<'deleteProject'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        userId: user.userId,
        traceId: body.traceId,
        projectsService: this.projectsService,
        membersService: this.membersService,
        rpcService: this.rpcService,
        db: this.db,
        cs: this.cs,
        logger: this.logger
      }),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> =>
          v.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        v.membersService.getMemberCheckIsAdminResult({
          projectId: v.projectId,
          memberId: v.userId
        })
      ),
      Result.andThrough(v =>
        v.rpcService.sendToDiskResult({
          request: {
            operation: 'deleteProject',
            traceId: v.traceId,
            input: {
              orgId: v.project.orgId,
              projectId: v.projectId
            }
          }
        })
      ),
      Result.andThrough(async v => {
        await retry(
          async () =>
            await v.db.drizzle.transaction(async tx => {
              await tx
                .delete(projectsTable)
                .where(eq(projectsTable.projectId, v.projectId));

              await tx
                .delete(membersTable)
                .where(eq(membersTable.projectId, v.projectId));

              await tx
                .delete(connectionsTable)
                .where(eq(connectionsTable.projectId, v.projectId));

              await tx
                .delete(envsTable)
                .where(eq(envsTable.projectId, v.projectId));

              await tx
                .delete(branchesTable)
                .where(eq(branchesTable.projectId, v.projectId));

              await tx
                .delete(bridgesTable)
                .where(eq(bridgesTable.projectId, v.projectId));

              await tx
                .delete(cachedPartsTable)
                .where(eq(cachedPartsTable.projectId, v.projectId));

              await tx
                .delete(cachedColumnsTable)
                .where(eq(cachedColumnsTable.projectId, v.projectId));
            }),
          getRetryOption(v.cs, v.logger)
        );

        return Result.succeed();
      }),
      Result.map((v): ToBackendDeleteProjectOutput => ({}))
    );
  }
}
