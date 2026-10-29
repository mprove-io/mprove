import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  type ToBackendCreateGivenRequestDto,
  ToBackendCreateGivenResponseDto
} from '#backend/controllers/givens/create-given/create-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { GivenTab } from '#backend/drizzle/postgres/tables/givens';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkGivenDoesNotExist } from '#backend/functions/db/givens/check-given-does-not-exist/check-given-does-not-exist';
import { getApiGivens } from '#backend/functions/db/givens/get-api-givens/get-api-givens';
import { makeGiven } from '#backend/functions/db/givens/make-given/make-given';
import { validateGivenValues } from '#backend/functions/db/givens/validate-given-values/validate-given-values';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateGivenOutput } from '#common/types/backend/routes/givens/create-given/create-given-output';

type CreateGivenWriteState = {
  projectId: string;
  userMember: MemberTab;
  given: GivenTab;
};

@ApiTags('Givens')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateGivenController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendCreateGiven' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateGiven',
    description: 'Create a project given'
  })
  @ApiOkResponse({
    type: ToBackendCreateGivenResponseDto
  })
  async createGiven(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateGivenRequestDto
  ): Promise<BackendResultForOperation<'createGiven'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        givenId: body.input.givenId,
        type: body.input.type,
        isMultiple: body.input.isMultiple,
        values: body.input.values,
        user: user
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        getMemberCheckIsAdmin({
          memberId: v.user.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        checkGivenDoesNotExist({
          db: this.db,
          projectId: v.projectId,
          givenId: v.givenId
        })
      ),
      Result.andThrough(v =>
        validateGivenValues({
          type: v.type,
          isMultiple: v.isMultiple,
          values: v.values
        })
      ),
      Result.map(v => {
        let givenWriteState: CreateGivenWriteState = {
          projectId: v.projectId,
          userMember: v.userMember,
          given: makeGiven({
            projectId: v.projectId,
            givenId: v.givenId,
            type: v.type,
            isMultiple: v.isMultiple,
            values: v.values
          })
        };

        return givenWriteState;
      }),
      Result.andThrough(v => this.db.write({ insert: { givens: [v.given] } })),
      Result.bind('apiGivens', v =>
        getApiGivens({ db: this.db, projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendCreateGivenOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          givens: v.apiGivens
        })
      )
    );
  }
}
