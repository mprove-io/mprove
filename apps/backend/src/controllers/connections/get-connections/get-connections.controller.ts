import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetConnectionsController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetConnections)
  async getConnections(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetConnectionsRequest = request.body;

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

    if (common.isUndefined(envId)) {
      let apiEnvs = await this.envsService.getApiEnvs({
        projectId: projectId
      });

      let apiEnv = apiEnvs.find(x => x.envId === envId);

      connections = await this.db.drizzle.query.connectionsTable.findMany({
        where: and(
          eq(connectionsTable.projectId, projectId),
          inArray(
            connectionsTable.connectionId,
            apiEnv.envConnectionIdsWithFallback
          )
        )
      });
    } else {
      connections = await this.db.drizzle.query.connectionsTable.findMany({
        where: eq(connectionsTable.projectId, projectId)
      });
    }

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetConnectionsResponsePayload = {
      userMember: apiMember,
      connections: connections
        .sort((a, b) =>
          a.connectionId > b.connectionId
            ? 1
            : b.connectionId > a.connectionId
              ? -1
              : 0
        )
        .map(x => this.wrapToApiService.wrapToApiConnection(x))
    };

    return payload;
  }
}
