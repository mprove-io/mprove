import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetProvidersRequestDto,
  ToBackendGetProvidersResponseDto
} from '#backend/controllers/providers/get-providers/get-providers.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetProvidersOutput } from '#common/types/backend/routes/providers/get-providers/get-providers-output';

@ApiTags('Providers')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetProvidersController {
  constructor(
    private providersService: ProvidersService,
    private membersService: MembersService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetProviders' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetProviders',
    description: 'Get project providers'
  })
  @ApiOkResponse({
    type: ToBackendGetProvidersResponseDto
  })
  async getProviders(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetProvidersRequestDto
  ): Promise<BackendResultForOperation<'getProviders'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.membersService.getMemberCheckIsEditorOrAdmin({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind('providers', v =>
        this.db.providers.findMany({
          where: eq(providersTable.projectId, v.projectId)
        })
      ),
      Result.map(
        (v): ToBackendGetProvidersOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          providers: v.providers
            .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
            .map(provider =>
              this.providersService.tabToApiProvider({
                provider: provider,
                isIncludePasswords: false
              })
            )
        })
      )
    );
  }
}
