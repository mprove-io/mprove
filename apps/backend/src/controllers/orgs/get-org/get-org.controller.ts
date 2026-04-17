import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetOrgRequestDto,
  ToBackendGetOrgResponseDto
} from '#backend/controllers/orgs/get-org/get-org.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { OrgsService } from '#backend/services/db/orgs.service';
import { TabService } from '#backend/services/tab.service';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ServerError } from '#common/models/server-error';
import type { ToBackendGetOrgResponsePayload } from '#common/zod/to-backend/orgs/to-backend-get-org';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetOrgController {
  constructor(
    private tabService: TabService,
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetOrg)
  @ApiOperation({
    summary: 'GetOrg',
    description: 'Get an organization'
  })
  @ApiOkResponse({
    type: ToBackendGetOrgResponseDto
  })
  async getOrg(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetOrgRequestDto
  ) {
    let { orgId } = body.payload;

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
