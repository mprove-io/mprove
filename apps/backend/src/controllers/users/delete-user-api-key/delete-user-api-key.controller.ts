import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import { ToBackendDeleteUserApiKeyResponseDto } from '#backend/controllers/users/delete-user-api-key/delete-user-api-key.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { UsersService } from '#backend/services/db/users.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteUserApiKeyController {
  constructor(
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteUserApiKey)
  @ApiOperation({
    summary: 'DeleteUserApiKey',
    description: "Revoke the current user's personal API key"
  })
  @ApiOkResponse({
    type: ToBackendDeleteUserApiKeyResponseDto
  })
  async deleteUserApiKey(@AttachUser() user: UserTab, @Req() request: any) {
    this.usersService.checkUserIsNotRestricted({ user: user });

    user.apiKeyPrefix = undefined;
    user.apiKeySecretHash = undefined;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              update: {
                users: [user]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
