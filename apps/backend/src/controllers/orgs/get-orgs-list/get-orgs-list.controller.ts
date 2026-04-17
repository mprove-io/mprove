import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetOrgsListRequestDto,
  ToBackendGetOrgsListResponseDto
} from '#backend/controllers/orgs/get-orgs-list/get-orgs-list.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { OrgsService } from '#backend/services/db/orgs.service';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetOrgsListResponsePayload } from '#common/zod/to-backend/orgs/to-backend-get-orgs-list';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetOrgsListController {
  constructor(
    private tabService: TabService,
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetOrgsList)
  @ApiOperation({
    summary: 'GetOrgsList',
    description: 'Get organizations accessible to the current user'
  })
  @ApiOkResponse({
    type: ToBackendGetOrgsListResponseDto
  })
  async getOrgsList(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetOrgsListRequestDto
  ) {
    let userMembers = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.memberId, user.userId)
    });

    let userProjectIds = userMembers.map(m => m.projectId);

    let userProjects =
      userProjectIds.length === 0
        ? []
        : await this.db.drizzle.query.projectsTable.findMany({
            where: inArray(projectsTable.projectId, userProjectIds)
          });

    let userOrgIds = userProjects.map(p => p.orgId);

    let userOrgs =
      userOrgIds.length === 0
        ? []
        : await this.db.drizzle.query.orgsTable
            .findMany({
              where: inArray(orgsTable.orgId, userOrgIds)
            })
            .then(xs => xs.map(x => this.tabService.orgEntToTab(x)));

    let ownerOrgs = await this.db.drizzle.query.orgsTable
      .findMany({
        where: eq(orgsTable.ownerId, user.userId)
      })
      .then(xs => xs.map(x => this.tabService.orgEntToTab(x)));

    let orgs = [...userOrgs];

    ownerOrgs.forEach(x => {
      if (orgs.map(y => y.orgId).indexOf(x.orgId) < 0) {
        orgs.push(x);
      }
    });

    let sortedOrgs = orgs.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );

    let payload: ToBackendGetOrgsListResponsePayload = {
      orgsList: sortedOrgs.map(x => this.orgsService.tabToApi({ org: x }))
    };

    return payload;
  }
}
