import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
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
  ) {
    let { projectId, type, targetId, isFavorite } = body.input;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    await this.favoritesService.setFavorite({
      projectId: projectId,
      userId: user.userId,
      type: type,
      targetId: targetId,
      isFavorite: isFavorite
    });

    let payload: ToBackendSetFavoriteOutput = {};

    return payload;
  }
}
