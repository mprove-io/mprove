import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendCompleteUserRegistrationRequestDto,
  ToBackendCompleteUserRegistrationResponseDto
} from '#backend/controllers/users/complete-user-registration/complete-user-registration.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { usersTable } from '#backend/drizzle/postgres/tables/users';
import { getDconfigHashSecret } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret/get-dconfig-hash-secret';
import { addMemberToDemoProject } from '#backend/functions/db/members/add-member-to-demo-project/add-member-to-demo-project';
import { userTabToApi } from '#backend/functions/db/users/user-tab-to-api/user-tab-to-api';
import {
  type CreateSaltAndHashOutput,
  createSaltAndHash
} from '#backend/functions/hash/create-salt-and-hash/create-salt-and-hash';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendConfirmUserEmailOutput } from '#common/types/backend/routes/users/confirm-user-email/confirm-user-email-output';

@ApiTags('Users')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Controller()
export class CompleteUserRegistrationController {
  constructor(
    private jwtService: JwtService,
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private tabService: TabService,
    private rpcService: RpcService,
    private logger: Logger
  ) {}

  @Post('api/ToBackendCompleteUserRegistration' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CompleteUserRegistration',
    description: 'Verify email, set password and finish registration'
  })
  @ApiOkResponse({
    type: ToBackendCompleteUserRegistrationResponseDto
  })
  async completeUserRegistration(
    @Body() body: ToBackendCompleteUserRegistrationRequestDto
  ): Promise<BackendResultForOperation<'completeUserRegistration'>> {
    return Result.pipe(
      Result.succeed({
        traceId: body.traceId,
        emailVerificationToken: body.input.emailVerificationToken,
        newPassword: body.input.newPassword
      }),
      Result.bind('hashSecret', v => getDconfigHashSecret({ db: this.db })),
      Result.bind('emailVerificationTokenHash', v =>
        makeHash({
          input: v.emailVerificationToken,
          hashSecret: v.hashSecret
        })
      ),
      Result.bind('user', v =>
        this.db.users.findFirstCheckExists({
          where: eq(
            usersTable.emailVerificationTokenHash,
            v.emailVerificationTokenHash
          )
        })
      ),
      Result.andThrough(v =>
        isDefined(v.user.passwordHash) || v.user.isEmailVerified === true
          ? Result.fail({ code: 'BACKEND_USER_ALREADY_REGISTERED' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        addMemberToDemoProject({
          traceId: v.traceId,
          user: v.user,
          cs: this.cs,
          db: this.db,
          tabService: this.tabService,
          rpcService: this.rpcService,
          logger: this.logger
        })
      ),
      Result.map(v => {
        v.user.isEmailVerified = true;

        return v;
      }),
      Result.bind('newPasswordHS', async v => {
        let newPasswordHS: CreateSaltAndHashOutput = await createSaltAndHash({
          input: v.newPassword
        });

        return Result.succeed(newPasswordHS);
      }),
      Result.map(v => {
        v.user.passwordHash = v.newPasswordHS.hash;
        v.user.passwordSalt = v.newPasswordHS.salt;
        v.user.passwordResetExpiresTs = 1;

        return v;
      }),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: {
            users: [v.user]
          }
        })
      ),
      Result.map(
        (v): ToBackendConfirmUserEmailOutput => ({
          token: this.jwtService.sign({ userId: v.user.userId }),
          user: userTabToApi({
            user: v.user
          })
        })
      )
    );
  }
}
