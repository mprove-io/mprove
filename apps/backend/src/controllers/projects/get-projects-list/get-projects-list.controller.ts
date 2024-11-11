import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetProjectsListController {
  constructor(
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProjectsList)
  async getProjectsList(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetProjectsListRequest = request.body;

    let { orgId } = reqValid.payload;

    let userMembers = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.memberId, user.userId)
    });

    // let userMembers = await this.membersRepository.find({
    //   where: {
    //     member_id: user.user_id
    //   }
    // });

    let projectIds = userMembers.map(m => m.projectId);

    let projects =
      projectIds.length === 0
        ? []
        : await this.db.drizzle.query.projectsTable.findMany({
            where: and(
              inArray(projectsTable.projectId, projectIds),
              eq(projectsTable.orgId, orgId)
            )
          });

    // await this.projectsRepository.find({
    //   where: {
    //     project_id: In(projectIds),
    //     org_id: orgId
    //   }
    // });

    let sortedProjects = projects.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );

    let payload: apiToBackend.ToBackendGetProjectsListResponsePayload = {
      projectsList: sortedProjects.map(x =>
        this.wrapToApiService.wrapToApiProjectsItem(x)
      )
    };

    return payload;
  }
}
