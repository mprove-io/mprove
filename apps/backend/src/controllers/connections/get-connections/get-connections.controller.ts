import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray, or } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendGetConnectionsRequest,
  ToBackendGetConnectionsResponsePayload
} from '~common/interfaces/to-backend/connections/to-backend-get-connections';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetConnectionsController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private wrapToApiService: WrapEnxToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetConnections)
  async getConnections(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetConnectionsRequest = request.body;

    let { projectId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    // let connectionsResult = await this.db.drizzle
    //   .select({
    //     record: connectionsTable,
    //     total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
    //   })
    //   .from(connectionsTable)
    //   .where(eq(connectionsTable.projectId, projectId))
    //   .orderBy(asc(connectionsTable.connectionId))
    //   .limit(perPage)
    //   .offset((pageNum - 1) * perPage);

    let connections;

    if (isDefined(envId)) {
      let apiEnvs = await this.envsService.getApiEnvs({
        projectId: projectId
      });

      let apiEnv = apiEnvs.find(x => x.envId === envId);

      connections = await this.db.drizzle.query.connectionsTable.findMany({
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
      });
    } else {
      connections = await this.db.drizzle.query.connectionsTable.findMany({
        where: eq(connectionsTable.projectId, projectId)
      });
    }

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: ToBackendGetConnectionsResponsePayload = {
      userMember: apiMember,
      connections: connections
        .sort((a, b) =>
          a.connectionId > b.connectionId
            ? 1
            : b.connectionId > a.connectionId
              ? -1
              : 0
        )
        .map(x =>
          this.wrapToApiService.wrapToApiProjectConnection({
            connection: x,
            isIncludePasswords: false
          })
        )
    };

    return payload;
  }
}
