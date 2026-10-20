import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendUpdateUserPasswordRequestDto,
  ToBackendUpdateUserPasswordResponseDto
} from '#backend/controllers/users/update-user-password/update-user-password.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { DbService } from '#backend/services/db/db.service';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import {
  type CreateSaltAndHashOutput,
  HashService
} from '#backend/services/hash/hash.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';

import type { BackendUpdatePasswordWrongTokenError } from '#common/types/backend/errors/backend-update-password-wrong-token-error';
import type { DbUsersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/users/db-users-find-first-check-exists-error';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

@ApiTags('Users')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Controller()
export class UpdateUserPasswordController {
  constructor(
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private db: DbService
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
          this.dconfigsService.getDconfigHashSecret()
      ),
      Result.bind(
        'passwordResetTokenHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHash({
            input: v.passwordResetToken,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'user',
        (v): Result.ResultAsync<UserTab, DbUsersFindFirstCheckExistsError> =>
          this.db.users.findFirstCheckExists({
            where: eq(
              usersTable.passwordResetTokenHash,
              v.passwordResetTokenHash
            )
          })
      ),
      Result.mapError(v =>
        v.code === 'BACKEND_USER_DOES_NOT_EXIST'
          ? ({
              code: 'BACKEND_UPDATE_PASSWORD_WRONG_TOKEN'
            } satisfies BackendUpdatePasswordWrongTokenError)
          : v
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
        this.db.write({ insertOrUpdate: { users: [v.user] } })
      ),
      Result.map((v): Record<string, never> => ({}))
    );
  }
}
