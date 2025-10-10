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
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetProjectsListRequest,
  ToBackendGetProjectsListResponsePayload
} from '~common/interfaces/to-backend/projects/to-backend-get-projects-list';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetProjectsListController {
  constructor(
    private wrapToApiService: WrapEnxToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetProjectsList)
  async getProjectsList(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetProjectsListRequest = request.body;

    let { orgId } = reqValid.payload;

    let userMembers = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.memberId, user.userId)
    });

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

    let sortedProjects = projects.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );

    let payload: ToBackendGetProjectsListResponsePayload = {
      projectsList: sortedProjects.map(x =>
        this.wrapToApiService.wrapToApiProjectsItem(x)
      )
    };

    return payload;
  }
}
