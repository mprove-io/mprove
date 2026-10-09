import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetOrgsListRequestDto,
  ToBackendGetOrgsListResponseDto
} from '#backend/controllers/orgs/get-orgs-list/get-orgs-list.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { OrgTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type MemberEnt,
  membersTable
} from '#backend/drizzle/postgres/schema/members';
import { type OrgEnt, orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import {
  type ProjectEnt,
  projectsTable
} from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { OrgEntToTabResultError } from '#common/types/backend/function-errors/org-ent-to-tab-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetOrgsListOutput } from '#common/types/backend/routes/orgs/get-orgs-list/get-orgs-list-output';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetOrgsListController {
  constructor(
    private tabService: TabService,
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
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
      Result.bind(
        'userMemberEnts',
        (v): Result.ResultAsync<MemberEnt[], never> =>
          this.db.drizzle.query.membersTable
            .findMany({
              where: eq(membersTable.memberId, v.userId)
            })
            .then(userMemberEnts => Result.succeed(userMemberEnts))
      ),
      Result.bind(
        'userProjectIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(
            v.userMemberEnts.map(userMemberEnt => userMemberEnt.projectId)
          )
      ),
      Result.bind(
        'userProjectEnts',
        async (v): Result.ResultAsync<ProjectEnt[], never> =>
          v.userProjectIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.projectsTable
                .findMany({
                  where: inArray(projectsTable.projectId, v.userProjectIds)
                })
                .then(userProjectEnts => Result.succeed(userProjectEnts))
      ),
      Result.bind(
        'userOrgIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(
            v.userProjectEnts.map(userProjectEnt => userProjectEnt.orgId)
          )
      ),
      Result.bind(
        'userOrgEnts',
        async (v): Result.ResultAsync<OrgEnt[], never> =>
          v.userOrgIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.orgsTable
                .findMany({
                  where: inArray(orgsTable.orgId, v.userOrgIds)
                })
                .then(userOrgEnts => Result.succeed(userOrgEnts))
      ),
      Result.bind(
        'orgs',
        (v): Result.ResultAsync<OrgTab[], OrgEntToTabResultError> =>
          this.db.drizzle.query.orgsTable
            .findMany({
              where: eq(orgsTable.ownerId, v.userId)
            })
            .then((ownerOrgEnts: OrgEnt[]) => {
              let orgEnts: OrgEnt[] = [...v.userOrgEnts];

              ownerOrgEnts.forEach(ownerOrgEnt => {
                if (
                  orgEnts.findIndex(
                    orgEnt => orgEnt.orgId === ownerOrgEnt.orgId
                  ) < 0
                ) {
                  orgEnts.push(ownerOrgEnt);
                }
              });

              return Result.sequence(orgEnts, orgEnt =>
                this.tabService.orgEntToTabResult({ orgEnt: orgEnt })
              );
            })
      ),
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
