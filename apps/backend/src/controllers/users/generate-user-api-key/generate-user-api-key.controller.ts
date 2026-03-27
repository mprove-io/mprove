import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { UsersService } from '#backend/services/db/users.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendGenerateUserApiKeyResponsePayload } from '#common/interfaces/to-backend/users/to-backend-generate-user-api-key';
import { buildUserApiKey } from '#node-common/functions/api-key/build-user-api-key';
import { generateApiKeyParts } from '#node-common/functions/api-key/generate-api-key-parts';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GenerateUserApiKeyController {
  constructor(
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGenerateUserApiKey)
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

    let payload: ToBackendGenerateUserApiKeyResponsePayload = {
      apiKey: apiKey,
      apiKeyPrefix: apiKeyParts.prefix
    };

    return payload;
  }
}
