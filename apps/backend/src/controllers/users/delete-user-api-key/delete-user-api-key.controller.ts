import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { ToBackendDeleteUserApiKeyResponseDto } from '#backend/controllers/users/delete-user-api-key/delete-user-api-key.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkUserIsNotRestricted } from '#backend/functions/db/users/check-user-is-not-restricted/check-user-is-not-restricted';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteUserApiKeyController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendDeleteUserApiKey' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteUserApiKey',
    description: "Revoke the current user's personal API key"
  })
  @ApiOkResponse({
    type: ToBackendDeleteUserApiKeyResponseDto
  })
  async deleteUserApiKey(
    @AttachUser() user: UserTab,
    @Req() request: any
  ): Promise<BackendResultForOperation<'deleteUserApiKey'>> {
    return Result.pipe(
      Result.succeed({ user: user }),
      Result.andThrough(v =>
        checkUserIsNotRestricted({
          user: v.user
        })
      ),
      Result.map(v => {
        v.user.apiKeyPrefix = undefined;

        v.user.apiKeySecretHash = undefined;

        return v;
      }),
      Result.andThrough(v =>
        this.db.write({
          update: {
            users: [v.user]
          }
        })
      ),
      Result.map((v): Record<string, never> => ({}))
    );
  }
}
