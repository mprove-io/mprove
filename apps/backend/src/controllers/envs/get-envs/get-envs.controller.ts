import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetEnvsController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvs)
  async getEnvs(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetEnvsRequest = request.body;

    let { projectId } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let envs = await this.db.drizzle.query.envsTable.findMany({
      where: eq(connectionsTable.projectId, projectId)
    });

    let connections = await this.db.drizzle.query.connectionsTable.findMany({
      where: and(
        eq(connectionsTable.projectId, projectId),
        inArray(
          connectionsTable.envId,
          envs.map(x => x.envId)
        )
      )
    });

    let members = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.projectId, projectId)
    });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetEnvsResponsePayload = {
      userMember: apiMember,
      envs: envs.map(x =>
        this.wrapToApiService.wrapToApiEnv({
          env: x,
          envConnectionIds: connections
            .filter(y => y.envId === x.envId)
            .map(connection => connection.connectionId),
          envMembers:
            x.envId === common.PROJECT_ENV_PROD
              ? []
              : members.filter(m => x.memberIds.indexOf(m.memberId) > -1)
        })
      )
    };

    return payload;
  }
}
