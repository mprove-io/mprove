import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
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

    let { projectId, perPage, pageNum } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let envsResult = await this.db.drizzle
      .select({
        record: envsTable,
        total: sql<number>`COUNT(*) OVER()` // Total count as a window function
      })
      .from(envsTable)
      .where(eq(envsTable.projectId, projectId))
      .orderBy(asc(envsTable.envId))
      .limit(perPage)
      .offset((pageNum - 1) * perPage);

    // const [envs, total] = await this.envsRepository.findAndCount({
    //   where: {
    //     project_id: projectId
    //   },
    //   order: {
    //     env_id: 'ASC'
    //   },
    //   take: perPage,
    //   skip: (pageNum - 1) * perPage
    // });

    let envs = envsResult.map(x => x.record);

    let connections = await this.db.drizzle.query.connectionsTable.findMany({
      where: and(
        eq(connectionsTable.projectId, projectId),
        inArray(
          connectionsTable.envId,
          envs.map(x => x.envId)
        )
      )
    });

    // let connections = await this.connectionsRepository.find({
    //   where: {
    //     project_id: projectId,
    //     env_id: In(envs.map(x => x.env_id))
    //   }
    // });

    let members = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.projectId, projectId)
    });

    // let members = await this.membersRepository.find({
    //   where: {
    //     project_id: projectId
    //   }
    // });

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
              ? members
              : members.filter(m => m.envs.indexOf(x.envId) > -1)
        })
      ),
      total: envsResult[0].total
    };

    return payload;
  }
}
