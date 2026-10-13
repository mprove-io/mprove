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
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendUpdateUserPasswordRequestDto,
  ToBackendUpdateUserPasswordResponseDto
} from '#backend/controllers/users/update-user-password/update-user-password.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import {
  type CreateSaltAndHashOutput,
  HashService
} from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendUpdatePasswordWrongTokenError } from '#common/types/backend/errors/backend-update-password-wrong-token-error';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';
import type { UserEntToTabError } from '#common/types/backend/function-errors/user-ent-to-tab-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

@ApiTags('Users')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Controller()
export class UpdateUserPasswordController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendUpdateUserPassword' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'UpdateUserPassword',
    description: 'Set a new password using a valid reset token'
  })
  @ApiOkResponse({
    type: ToBackendUpdateUserPasswordResponseDto
  })
  async updateUserPassword(
    @Body() body: ToBackendUpdateUserPasswordRequestDto
  ): Promise<BackendResultForOperation<'updateUserPassword'>> {
    return Result.pipe(
      Result.succeed({
        passwordResetToken: body.input.passwordResetToken,
        newPassword: body.input.newPassword
      }),
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretError> =>
          this.dconfigsService.getDconfigHashSecretResult()
      ),
      Result.bind(
        'passwordResetTokenHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.passwordResetToken,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'user',
        (
          v
        ): Result.ResultAsync<
          UserTab,
          UserEntToTabError | BackendUpdatePasswordWrongTokenError
        > =>
          this.db.drizzle.query.usersTable
            .findFirst({
              where: eq(
                usersTable.passwordResetTokenHash,
                v.passwordResetTokenHash
              )
            })
            .then(x =>
              isUndefined(x)
                ? Result.fail({ code: 'BACKEND_UPDATE_PASSWORD_WRONG_TOKEN' })
                : this.tabService.userEntToTabResult({ userEnt: x })
            )
      ),
      Result.andThrough(v => {
        let nowTs: number = makeTsNumber();

        return v.user.passwordResetExpiresTs < nowTs
          ? Result.fail({ code: 'BACKEND_UPDATE_PASSWORD_TOKEN_EXPIRED' })
          : Result.succeed();
      }),
      Result.bind(
        'passwordHS',
        async (v): Result.ResultAsync<CreateSaltAndHashOutput, never> => {
          let passwordHS: CreateSaltAndHashOutput =
            await this.hashService.createSaltAndHash({ input: v.newPassword });

          return Result.succeed(passwordHS);
        }
      ),
      Result.map(v => {
        v.user.passwordHash = v.passwordHS.hash;
        v.user.passwordSalt = v.passwordHS.salt;
        v.user.passwordResetExpiresTs = 1;
        v.user.jwtMinIat = makeTsNumber();

        return v;
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: { users: [v.user] }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.map((v): Record<string, never> => ({}))
    );
  }
}
