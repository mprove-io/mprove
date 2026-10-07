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
import { buildUserApiKey } from '#backend/controllers/users/generate-user-api-key/build-user-api-key/build-user-api-key';
import { ToBackendGenerateUserApiKeyResponseDto } from '#backend/controllers/users/generate-user-api-key/generate-user-api-key.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { generateApiKeyParts } from '#backend/functions/api-key/generate-api-key-parts/generate-api-key-parts';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { UsersService } from '#backend/services/db/users/users.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGenerateUserApiKeyOutput } from '#common/types/backend/routes/users/generate-user-api-key/generate-user-api-key-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GenerateUserApiKeyController {
  constructor(
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendGenerateUserApiKey' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GenerateUserApiKey',
    description:
      'Generate and store a new personal API key for the current user'
  })
  @ApiOkResponse({
    type: ToBackendGenerateUserApiKeyResponseDto
  })
  async generateUserApiKey(@AttachUser() user: UserTab, @Req() request: any) {
    this.usersService.checkUserIsNotRestricted({ user: user });

    let apiKeyParts: {
      prefix: string;
      secret: string;
      secretHash: string;
      salt: string;
    };

    await retry(
      async () => {
        apiKeyParts = await generateApiKeyParts();

        user.apiKeyPrefix = apiKeyParts.prefix;
        user.apiKeySecretHash = apiKeyParts.secretHash;
        user.apiKeySalt = apiKeyParts.salt;

        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              update: {
                users: [user]
              }
            })
        );
      },
      getRetryOption(this.cs, this.logger)
    );

    let apiKey = buildUserApiKey({
      prefix: apiKeyParts.prefix,
      userId: user.userId,
      secret: apiKeyParts.secret
    });

    let payload: ToBackendGenerateUserApiKeyOutput = {
      apiKey: apiKey,
      apiKeyPrefix: apiKeyParts.prefix
    };

    return payload;
  }
}
