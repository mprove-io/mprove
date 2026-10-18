import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteUserCodexAuthRequestDto,
  ToBackendDeleteUserCodexAuthResponseDto
} from '#backend/controllers/users/delete-user-codex-auth/delete-user-codex-auth.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
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
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.writeUnwrap({
                      tx: tx,
                      insertOrUpdate: {
                        users: [v.user]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
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
