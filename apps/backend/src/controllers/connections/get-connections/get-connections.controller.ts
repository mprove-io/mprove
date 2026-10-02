import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { and, eq, inArray, or } from 'drizzle-orm';
import {
  ToBackendGetConnectionsRequestDto,
  ToBackendGetConnectionsResponseDto
} from '#backend/controllers/connections/get-connections/get-connections.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ConnectionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ConnectionsService } from '#backend/services/db/connections.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetConnectionsOutput } from '#common/types/backend/routes/connections/get-connections/get-connections-output';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetConnectionsController {
  constructor(
    private tabService: TabService,
    private connectionsService: ConnectionsService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
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
  ) {
    let { projectId, envId } = body.input;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let connections: ConnectionTab[];

    if (isDefined(envId)) {
      let apiEnvs = await this.envsService.getApiEnvs({
        projectId: projectId
      });

      let apiEnv = apiEnvs.find(x => x.envId === envId);

      connections = await this.db.drizzle.query.connectionsTable
        .findMany({
          where: and(
            eq(connectionsTable.projectId, projectId),
            or(
              eq(connectionsTable.envId, envId),
              and(
                eq(connectionsTable.envId, PROJECT_ENV_PROD),
                inArray(
                  connectionsTable.connectionId,
                  apiEnv.fallbackConnectionIds
                )
              )
            )
          )
        })
        .then(xs => xs.map(x => this.tabService.connectionEntToTab(x)));
    } else {
      connections = await this.db.drizzle.query.connectionsTable
        .findMany({
          where: eq(connectionsTable.projectId, projectId)
        })
        .then(xs => xs.map(x => this.tabService.connectionEntToTab(x)));
    }

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let payload: ToBackendGetConnectionsOutput = {
      userMember: apiUserMember,
      connections: connections
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
    };

    return payload;
  }
}
