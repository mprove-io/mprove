import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetEnvsListController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvsList)
  async getEnvsList(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetEnvsListRequest = request.body;

    let { projectId, isFilter } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let envs: schemaPostgres.EnvEnt[] = [];

    if (isFilter === true) {
      envs = await this.db.drizzle.query.envsTable.findMany({
        where: and(
          eq(envsTable.projectId, projectId),
          inArray(envsTable.envId, [...member.envs, common.PROJECT_ENV_PROD])
        )
      });

      // envs = await this.envsRepository.find({
      //   where: {
      //     project_id: projectId,
      //     env_id: In([...member.envs, common.PROJECT_ENV_PROD])
      //   }
      // });
    } else {
      envs = await this.db.drizzle.query.envsTable.findMany({
        where: eq(envsTable.projectId, projectId)
      });

      // envs = await this.envsRepository.find({
      //   where: { project_id: projectId }
      // });
    }

    let sortedEnvs = envs.sort((a, b) =>
      a.envId > b.envId ? 1 : b.envId > a.envId ? -1 : 0
    );

    let payload: apiToBackend.ToBackendGetEnvsListResponsePayload = {
      envsList: sortedEnvs.map(x => this.wrapToApiService.wrapToApiEnvsItem(x))
    };

    return payload;
  }
}
