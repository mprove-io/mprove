import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or } from 'drizzle-orm';
import {
  type ToBackendGetConnectionsRequestDto,
  ToBackendGetConnectionsResponseDto
} from '#backend/controllers/connections/get-connections/get-connections.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { connectionsTable } from '#backend/drizzle/postgres/tables/connections';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { tabToApiProjectConnection } from '#backend/functions/db/connections/tab-to-api-project-connection/tab-to-api-project-connection';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { getMemberCheckIsEditorOrAdmin } from '#backend/functions/db/members/get-member-check-is-editor-or-admin/get-member-check-is-editor-or-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetConnectionsOutput } from '#common/types/backend/routes/connections/get-connections/get-connections-output';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetConnectionsController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendGetConnections' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetConnections',
    description: 'Get project connections for an environment'
  })
  @ApiOkResponse({
    type: ToBackendGetConnectionsResponseDto
  })
  async getConnections(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetConnectionsRequestDto
  ): Promise<BackendResultForOperation<'getConnections'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        getMemberCheckIsEditorOrAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.bind('apiEnvs', async v =>
        isDefined(v.envId)
          ? getApiEnvs({ db: this.db, projectId: v.projectId })
          : Result.succeed([])
      ),
      Result.bind('apiEnv', v =>
        Result.succeed(v.apiEnvs.find(apiEnv => apiEnv.envId === v.envId))
      ),
      Result.bind('connections', v =>
        this.db.connections.findMany({
          where: isDefined(v.envId)
            ? and(
                eq(connectionsTable.projectId, v.projectId),
                or(
                  eq(connectionsTable.envId, v.envId),
                  and(
                    eq(connectionsTable.envId, PROJECT_ENV_PROD),
                    inArray(
                      connectionsTable.connectionId,
                      v.apiEnv.fallbackConnectionIds
                    )
                  )
                )
              )
            : eq(connectionsTable.projectId, v.projectId)
        })
      ),
      Result.map(
        (v): ToBackendGetConnectionsOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          connections: v.connections
            .sort((a, b) =>
              a.connectionId > b.connectionId
                ? 1
                : b.connectionId > a.connectionId
                  ? -1
                  : 0
            )
            .map(x =>
              tabToApiProjectConnection({
                connection: x,
                isIncludePasswords: false
              })
            )
        })
      )
    );
  }
}
