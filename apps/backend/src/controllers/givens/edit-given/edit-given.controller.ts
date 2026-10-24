import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendEditGivenRequestDto,
  ToBackendEditGivenResponseDto
} from '#backend/controllers/givens/edit-given/edit-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { givensTable } from '#backend/drizzle/postgres/schema/givens';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getApiGivens } from '#backend/functions/db/givens/get-api-givens/get-api-givens';
import { validateGivenValues } from '#backend/functions/db/givens/validate-given-values/validate-given-values';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditGivenOutput } from '#common/types/backend/routes/givens/edit-given/edit-given-output';

@ApiTags('Givens')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditGivenController {
  constructor(private db: DbService) {}

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
      Result.bind('userMember', v =>
        getMemberCheckIsAdmin({
          memberId: v.user.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.bind('given', v =>
        this.db.givens.findFirstCheckExists({
          where: and(
            eq(givensTable.projectId, v.projectId),
            eq(givensTable.givenId, v.givenId)
          )
        })
      ),
      Result.andThrough(v =>
        validateGivenValues({
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
      Result.bind('apiGivens', v =>
        getApiGivens({ db: this.db, projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendEditGivenOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          givens: v.apiGivens
        })
      )
    );
  }
}
