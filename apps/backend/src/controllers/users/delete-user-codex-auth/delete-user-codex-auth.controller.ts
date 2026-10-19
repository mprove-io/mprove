import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  ToBackendDeleteUserCodexAuthRequestDto,
  ToBackendDeleteUserCodexAuthResponseDto
} from '#backend/controllers/users/delete-user-codex-auth/delete-user-codex-auth.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { UsersService } from '#backend/services/db/users/users.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteUserCodexAuthOutput } from '#common/types/backend/routes/users/delete-user-codex-auth/delete-user-codex-auth-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteUserCodexAuthController {
  constructor(
    private usersService: UsersService,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteUserCodexAuth' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteUserCodexAuth',
    description: "Clear the user's Codex auth credentials"
  })
  @ApiOkResponse({
    type: ToBackendDeleteUserCodexAuthResponseDto
  })
  async deleteUserCodexAuth(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteUserCodexAuthRequestDto
  ): Promise<BackendResultForOperation<'deleteUserCodexAuth'>> {
    return Result.pipe(
      Result.succeed({ user: user }),
      Result.andThrough(v =>
        this.usersService.checkUserIsNotRestricted({ user: v.user })
      ),
      Result.map(v => {
        v.user.codexAuth = undefined;
        v.user.codexAuthUpdateTs = undefined;
        v.user.codexAuthExpiresTs = undefined;

        return v;
      }),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: {
            users: [v.user]
          }
        })
      ),
      Result.map(
        (v): ToBackendDeleteUserCodexAuthOutput => ({
          user: this.usersService.tabToApi({ user: v.user })
        })
      )
    );
  }
}
