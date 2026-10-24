import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  type ToBackendUpdateUserPasswordRequestDto,
  ToBackendUpdateUserPasswordResponseDto
} from '#backend/controllers/users/update-user-password/update-user-password.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { getDconfigHashSecret } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret/get-dconfig-hash-secret';
import {
  type CreateSaltAndHashOutput,
  createSaltAndHash
} from '#backend/functions/hash/create-salt-and-hash/create-salt-and-hash';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { BackendUpdatePasswordWrongTokenError } from '#common/types/backend/errors/backend-update-password-wrong-token-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

@ApiTags('Users')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Controller()
export class UpdateUserPasswordController {
  constructor(private db: DbService) {}

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
      Result.bind('hashSecret', v => getDconfigHashSecret({ db: this.db })),
      Result.bind('passwordResetTokenHash', v =>
        makeHash({
          input: v.passwordResetToken,
          hashSecret: v.hashSecret
        })
      ),
      Result.bind('user', v =>
        this.db.users.findFirstCheckExists({
          where: eq(usersTable.passwordResetTokenHash, v.passwordResetTokenHash)
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
      Result.bind('passwordHS', async v => {
        let passwordHS: CreateSaltAndHashOutput = await createSaltAndHash({
          input: v.newPassword
        });

        return Result.succeed(passwordHS);
      }),
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
