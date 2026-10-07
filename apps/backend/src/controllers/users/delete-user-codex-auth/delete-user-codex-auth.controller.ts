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
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteUserCodexAuthRequestDto,
  ToBackendDeleteUserCodexAuthResponseDto
} from '#backend/controllers/users/delete-user-codex-auth/delete-user-codex-auth.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { UsersService } from '#backend/services/db/users/users.service';
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
  ) {
    this.usersService.checkUserIsNotRestricted({ user: user });

    user.codexAuth = undefined;
    user.codexAuthUpdateTs = undefined;
    user.codexAuthExpiresTs = undefined;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                users: [user]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendDeleteUserCodexAuthOutput = {
      user: this.usersService.tabToApi({ user: user })
    };

    return payload;
  }
}
