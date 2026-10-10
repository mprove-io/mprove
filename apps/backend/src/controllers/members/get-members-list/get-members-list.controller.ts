import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendGetMembersListRequestDto,
  ToBackendGetMembersListResponseDto
} from '#backend/controllers/members/get-members-list/get-members-list.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { GetMemberCheckIsAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-admin-result-error';
import type { MemberEntToTabResultError } from '#common/types/backend/function-errors/member-ent-to-tab-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetMembersListOutput } from '#common/types/backend/routes/members/get-members-list/get-members-list-output';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetMembersListController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendGetMembersList' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetMembersList',
    description: 'Get the full list of project members'
  })
  @ApiOkResponse({
    type: ToBackendGetMembersListResponseDto
  })
  async getMembersList(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetMembersListRequestDto
  ): Promise<BackendResultForOperation<'getMembersList'>> {
    return Result.pipe(
      Result.succeed({ projectId: body.input.projectId, userId: user.userId }),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminResultError> =>
          this.membersService.getMemberCheckIsAdminResult({
            memberId: v.userId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'members',
        (v): Result.ResultAsync<MemberTab[], MemberEntToTabResultError> =>
          this.db.drizzle.query.membersTable
            .findMany({ where: eq(membersTable.projectId, v.projectId) })
            .then(memberEnts =>
              Result.sequence(memberEnts, memberEnt =>
                this.tabService.memberEntToTabResult({ memberEnt: memberEnt })
              )
            )
      ),
      Result.map(
        (v): ToBackendGetMembersListOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          membersList: v.members.map(member =>
            this.envsService.wrapToApiEnvUser({ member: member })
          )
        })
      )
    );
  }
}
