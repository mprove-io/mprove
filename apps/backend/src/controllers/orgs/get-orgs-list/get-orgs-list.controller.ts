import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetOrgsListRequestDto,
  ToBackendGetOrgsListResponseDto
} from '#backend/controllers/orgs/get-orgs-list/get-orgs-list.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { OrgTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetOrgsListOutput } from '#common/types/backend/routes/orgs/get-orgs-list/get-orgs-list-output';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetOrgsListController {
  constructor(
    private orgsService: OrgsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetOrgsList' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'getOrgsList'>> {
    return Result.pipe(
      Result.succeed({
        userId: user.userId
      }),
      Result.bind('userMembers', v =>
        this.db.members.findMany({
          where: eq(membersTable.memberId, v.userId)
        })
      ),
      Result.bind('userProjectIds', v =>
        Result.succeed(v.userMembers.map(userMember => userMember.projectId))
      ),
      Result.bind('userProjects', async v =>
        v.userProjectIds.length === 0
          ? Result.succeed([])
          : this.db.projects.findMany({
              where: inArray(projectsTable.projectId, v.userProjectIds)
            })
      ),
      Result.bind('userOrgIds', v =>
        Result.succeed(v.userProjects.map(userProject => userProject.orgId))
      ),
      Result.bind('userOrgs', async v =>
        v.userOrgIds.length === 0
          ? Result.succeed([])
          : this.db.orgs.findMany({
              where: inArray(orgsTable.orgId, v.userOrgIds)
            })
      ),
      Result.bind('ownerOrgs', v =>
        this.db.orgs.findMany({
          where: eq(orgsTable.ownerId, v.userId)
        })
      ),
      Result.bind('orgs', v => {
        let orgs: OrgTab[] = [...v.userOrgs];

        v.ownerOrgs.forEach(ownerOrg => {
          if (orgs.findIndex(org => org.orgId === ownerOrg.orgId) < 0) {
            orgs.push(ownerOrg);
          }
        });

        return Result.succeed(orgs);
      }),
      Result.map(
        (v): ToBackendGetOrgsListOutput => ({
          orgsList: v.orgs
            .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
            .map(org => this.orgsService.tabToApi({ org: org }))
        })
      )
    );
  }
}
