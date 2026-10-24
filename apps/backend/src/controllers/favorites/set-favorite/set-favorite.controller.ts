import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendSetFavoriteRequestDto,
  ToBackendSetFavoriteResponseDto
} from '#backend/controllers/favorites/set-favorite/set-favorite.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { setFavorite } from '#backend/functions/db/favorites/set-favorite/set-favorite';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetFavoriteOutput } from '#common/types/backend/routes/favorites/set-favorite/set-favorite-output';

@ApiTags('Favorites')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetFavoriteController {
  constructor(private db: DbService) {}

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
        projectId: body.input.projectId,
        type: body.input.type,
        targetId: body.input.targetId,
        isFavorite: body.input.isFavorite,
        user: user
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.andThrough(v =>
        setFavorite({
          db: this.db,
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
