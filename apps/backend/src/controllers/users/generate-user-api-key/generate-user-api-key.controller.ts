import { Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import { buildUserApiKey } from '#backend/controllers/users/generate-user-api-key/build-user-api-key/build-user-api-key';
import { ToBackendGenerateUserApiKeyResponseDto } from '#backend/controllers/users/generate-user-api-key/generate-user-api-key.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type GenerateApiKeyPartsOutput,
  generateApiKeyParts
} from '#backend/functions/api-key/generate-api-key-parts/generate-api-key-parts';
import { checkUserIsNotRestricted } from '#backend/functions/db/users/check-user-is-not-restricted/check-user-is-not-restricted';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { DbErrorToError } from '#common/types/backend/function-errors/db/db-error-to-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGenerateUserApiKeyOutput } from '#common/types/backend/routes/users/generate-user-api-key/generate-user-api-key-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GenerateUserApiKeyController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
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
  async generateUserApiKey(
    @AttachUser() user: UserTab,
    @Req() request: any
  ): Promise<BackendResultForOperation<'generateUserApiKey'>> {
    return Result.pipe(
      Result.succeed({ user: user }),
      Result.andThrough(v =>
        checkUserIsNotRestricted({
          user: v.user
        })
      ),
      Result.bind('apiKeyParts', async v => {
        let apiKeyParts: GenerateApiKeyPartsOutput;

        let persistenceResult: Result.Result<void, DbErrorToError> =
          await dbErrorToResult({
            action: async () => {
              await retry(
                async () => {
                  apiKeyParts = await generateApiKeyParts();

                  v.user.apiKeyPrefix = apiKeyParts.prefix;
                  v.user.apiKeySecretHash = apiKeyParts.secretHash;
                  v.user.apiKeySalt = apiKeyParts.salt;

                  await this.db.writeUnwrap({
                    update: {
                      users: [v.user]
                    },
                    retryOptions: { retries: 0 }
                  });
                },
                getRetryOption(this.cs, this.logger)
              );
            }
          });

        return Result.isFailure(persistenceResult)
          ? Result.fail(persistenceResult.error)
          : Result.succeed(apiKeyParts);
      }),
      Result.map(
        (v): ToBackendGenerateUserApiKeyOutput => ({
          apiKey: buildUserApiKey({
            prefix: v.apiKeyParts.prefix,
            userId: v.user.userId,
            secret: v.apiKeyParts.secret
          }),
          apiKeyPrefix: v.apiKeyParts.prefix
        })
      )
    );
  }
}
