import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray, or } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ConnectionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { ConnectionsService } from '#backend/services/db/connections.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendGetConnectionsRequest,
  ToBackendGetConnectionsResponsePayload
} from '#common/interfaces/to-backend/connections/to-backend-get-connections';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
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

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetConnections)
  async getConnections(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetConnectionsRequest = request.body;

    let { projectId, envId } = reqValid.payload;

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

    let payload: ToBackendGetConnectionsResponsePayload = {
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
