import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendCreateGivenRequestDto,
  ToBackendCreateGivenResponseDto
} from '#backend/controllers/givens/create-given/create-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  GivenTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { checkGivenDoesNotExist } from '#backend/functions/db/givens/check-given-does-not-exist/check-given-does-not-exist';
import { getApiGivens } from '#backend/functions/db/givens/get-api-givens/get-api-givens';
import { makeGiven } from '#backend/functions/db/givens/make-given/make-given';
import { validateGivenValues } from '#backend/functions/db/givens/validate-given-values/validate-given-values';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { HashService } from '#backend/services/hash/hash.service';
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
  constructor(
    private membersService: MembersService,
    private db: DbService,
    private hashService: HashService
  ) {}

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
        this.membersService.getMemberCheckIsAdmin({
          memberId: v.user.userId,
          projectId: v.projectId
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
            hashService: this.hashService,
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
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          givens: v.apiGivens
        })
      )
    );
  }
}
