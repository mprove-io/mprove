import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendEditGivenRequestDto,
  ToBackendEditGivenResponseDto
} from '#backend/controllers/givens/edit-given/edit-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  GivenTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { givensTable } from '#backend/drizzle/postgres/schema/givens';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { MembersService } from '#backend/services/db/members/members.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { DbGivensFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/givens/db-givens-find-first-check-exists-error';
import type { GetApiGivensError } from '#common/types/backend/function-errors/get-api-givens-error';
import type { GetMemberCheckIsAdminError } from '#common/types/backend/function-errors/get-member-check-is-admin-error';
import type { Given } from '#common/types/backend/parts/given/given';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditGivenOutput } from '#common/types/backend/routes/givens/edit-given/edit-given-output';

@ApiTags('Givens')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditGivenController {
  constructor(
    private membersService: MembersService,
    private givensService: GivensService,
    private db: DbService
  ) {}

  @Post('api/ToBackendEditGiven' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditGiven',
    description: 'Edit a project given'
  })
  @ApiOkResponse({
    type: ToBackendEditGivenResponseDto
  })
  async editGiven(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditGivenRequestDto
  ): Promise<BackendResultForOperation<'editGiven'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        givenId: body.input.givenId,
        values: body.input.values,
        user: user
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminError> =>
          this.membersService.getMemberCheckIsAdmin({
            memberId: v.user.userId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'given',
        (v): Result.ResultAsync<GivenTab, DbGivensFindFirstCheckExistsError> =>
          this.db.givens.findFirstCheckExists({
            where: and(
              eq(givensTable.projectId, v.projectId),
              eq(givensTable.givenId, v.givenId)
            )
          })
      ),
      Result.andThrough(v =>
        this.givensService.validateGivenValues({
          type: v.given.type,
          isMultiple: v.given.isMultiple === true,
          values: v.values
        })
      ),
      Result.map(v => {
        v.given.values = v.values;
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({ insertOrUpdate: { givens: [v.given] } })
      ),
      Result.bind(
        'apiGivens',
        (v): Result.ResultAsync<Given[], GetApiGivensError> =>
          this.givensService.getApiGivens({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendEditGivenOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          givens: v.apiGivens
        })
      )
    );
  }
}
