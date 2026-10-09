import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  ToBackendSetFavoriteRequestDto,
  ToBackendSetFavoriteResponseDto
} from '#backend/controllers/favorites/set-favorite/set-favorite.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { FavoritesService } from '#backend/services/db/favorites/favorites.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetFavoriteOutput } from '#common/types/backend/routes/favorites/set-favorite/set-favorite-output';

@ApiTags('Favorites')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetFavoriteController {
  constructor(
    private favoritesService: FavoritesService,
    private membersService: MembersService,
    private projectsService: ProjectsService
  ) {}

  @Post('api/ToBackendSetFavorite' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SetFavorite',
    description: 'Set or unset a user favorite Report/Dashboard/Chart'
  })
  @ApiOkResponse({
    type: ToBackendSetFavoriteResponseDto
  })
  async setFavorite(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSetFavoriteRequestDto
  ): Promise<BackendResultForOperation<'setFavorite'>> {
    return Result.pipe(
      Result.succeed({
        ...body.input,
        user: user,
        projectsService: this.projectsService,
        membersService: this.membersService,
        favoritesService: this.favoritesService
      }),
      Result.andThrough(v =>
        v.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        v.membersService.getMemberCheckExistsResult({
          projectId: v.projectId,
          memberId: v.user.userId
        })
      ),
      Result.andThrough(v =>
        v.favoritesService.setFavoriteResult({
          projectId: v.projectId,
          userId: v.user.userId,
          type: v.type,
          targetId: v.targetId,
          isFavorite: v.isFavorite
        })
      ),
      Result.map((v): ToBackendSetFavoriteOutput => ({}))
    );
  }
}
