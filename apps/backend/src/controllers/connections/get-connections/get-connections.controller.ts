import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or } from 'drizzle-orm';
import {
  ToBackendGetConnectionsRequestDto,
  ToBackendGetConnectionsResponseDto
} from '#backend/controllers/connections/get-connections/get-connections.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  ConnectionTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { DbConnectionsFindManyError } from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { GetMemberCheckIsEditorOrAdminError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-error';
import type { Env } from '#common/types/backend/parts/env';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetConnectionsOutput } from '#common/types/backend/routes/connections/get-connections/get-connections-output';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetConnectionsController {
  constructor(
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private db: DbService
  ) {}

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
      Result.bind(
        'userMember',
        (
          v
        ): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorOrAdminError> =>
          this.membersService.getMemberCheckIsEditorOrAdmin({
            memberId: v.userId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'apiEnvs',
        async (v): Result.ResultAsync<Env[], GetApiEnvsError> =>
          isDefined(v.envId)
            ? this.envsService.getApiEnvs({ projectId: v.projectId })
            : Result.succeed([])
      ),
      Result.bind(
        'apiEnv',
        (v): Result.Result<Env, never> =>
          Result.succeed(v.apiEnvs.find(apiEnv => apiEnv.envId === v.envId))
      ),
      Result.bind(
        'connections',
        (v): Result.ResultAsync<ConnectionTab[], DbConnectionsFindManyError> =>
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
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          connections: v.connections
            .sort((a, b) =>
              a.connectionId > b.connectionId
                ? 1
                : b.connectionId > a.connectionId
                  ? -1
                  : 0
            )
            .map(x =>
              this.connectionsService.tabToApiProjectConnection({
                connection: x,
                isIncludePasswords: false
              })
            )
        })
      )
    );
  }
}
