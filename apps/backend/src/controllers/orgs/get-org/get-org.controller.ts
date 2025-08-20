import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetOrgController {
  constructor(
    private orgsService: OrgsService,
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetOrg)
  async getOrg(@AttachUser() user: UserEnt, @Req() request: any) {
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
      org: this.wrapToApiService.wrapToApiOrg(org)
    };

    return payload;
  }
}
