import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetGivensRequestDto,
  ToBackendGetGivensResponseDto
} from '#backend/controllers/givens/get-givens/get-givens.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { MembersService } from '#backend/services/db/members/members.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetGivensOutput } from '#common/types/backend/routes/givens/get-givens/get-givens-output';

@ApiTags('Givens')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetGivensController {
  constructor(
    private membersService: MembersService,
    private givensService: GivensService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetGivens' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetGivens',
    description: 'Get project givens'
  })
  @ApiOkResponse({
    type: ToBackendGetGivensResponseDto
  })
  async getGivens(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetGivensRequestDto
  ): Promise<BackendResultForOperation<'getGivens'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        user: user
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.membersService.getMemberCheckIsEditorOrAdmin({
          projectId: v.projectId,
          memberId: v.user.userId
        })
      ),
      Result.bind('apiGivens', v =>
        this.givensService.getApiGivens({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendGetGivensOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          givens: v.apiGivens
        })
      )
    );
  }
}
