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
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { UsersService } from '#backend/services/db/users.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendDeleteUserCodexAuthResponsePayload } from '#common/zod/to-backend/users/to-backend-delete-user-codex-auth';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteUserCodexAuth)
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

    let payload: ToBackendDeleteUserCodexAuthResponsePayload = {
      user: this.usersService.tabToApi({ user: user })
    };

    return payload;
  }
}
