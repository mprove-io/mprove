import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/db/orgs.service';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetOrgRequest,
  ToBackendGetOrgResponsePayload
} from '~common/interfaces/to-backend/orgs/to-backend-get-org';
import { ServerError } from '~common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetOrgController {
  constructor(
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetOrg)
  async getOrg(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetOrgRequest = request.body;

    let { orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    if (org.ownerId !== user.userId) {
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

      let orgIds = projects.map(x => x.orgId);

      if (orgIds.indexOf(orgId) < 0) {
        throw new ServerError({
          message: ErEnum.BACKEND_FORBIDDEN_ORG
        });
      }
    }

    let payload: ToBackendGetOrgResponsePayload = {
      org: this.orgsService.tabToApi({ org: org })
    };

    return payload;
  }
}
