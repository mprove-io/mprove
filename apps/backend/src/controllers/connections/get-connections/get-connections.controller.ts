import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetConnectionsController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetConnections)
  async getConnections(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetConnectionsRequest = request.body;

    let { projectId, perPage, pageNum } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let connectionsResult = await this.db.drizzle
      .select({
        record: connectionsTable,
        total: sql<number>`COUNT(*) OVER()` // Total count as a window function
      })
      .from(connectionsTable)
      .where(eq(connectionsTable.projectId, projectId))
      .orderBy(asc(connectionsTable.connectionId))
      .limit(perPage)
      .offset((pageNum - 1) * perPage);

    // const [connections, total] = await this.connectionsRepository.findAndCount({
    //   where: {
    //     project_id: projectId
    //   },
    //   order: {
    //     connection_id: 'ASC'
    //   },
    //   take: perPage,
    //   skip: (pageNum - 1) * perPage
    // });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetConnectionsResponsePayload = {
      userMember: apiMember,
      connections: connectionsResult.map(x =>
        this.wrapToApiService.wrapToApiConnection(x.record)
      ),
      total: connectionsResult.length > 0 ? connectionsResult[0].total : 0
    };

    return payload;
  }
}
