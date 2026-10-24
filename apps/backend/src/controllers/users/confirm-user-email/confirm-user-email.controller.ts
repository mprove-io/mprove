import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendConfirmUserEmailRequestDto,
  ToBackendConfirmUserEmailResponseDto
} from '#backend/controllers/users/confirm-user-email/confirm-user-email.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { getDconfigHashSecret } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret/get-dconfig-hash-secret';
import { addMemberToDemoProject } from '#backend/functions/db/members/add-member-to-demo-project/add-member-to-demo-project';
import { checkUserPasswordHashIsDefined } from '#backend/functions/db/users/check-user-password-hash-is-defined/check-user-password-hash-is-defined';
import { userTabToApi } from '#backend/functions/db/users/user-tab-to-api/user-tab-to-api';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendConfirmUserEmailOutput } from '#common/types/backend/routes/users/confirm-user-email/confirm-user-email-output';

@ApiTags('Users')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Controller()
export class ConfirmUserEmailController {
  constructor(
    private jwtService: JwtService,
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private tabService: TabService,
    private rpcService: RpcService,
    private logger: Logger
  ) {}

  @Post('api/ToBackendConfirmUserEmail' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'ConfirmUserEmail',
    description: "Verify the user's email using the verification token"
  })
  @ApiOkResponse({
    type: ToBackendConfirmUserEmailResponseDto
  })
  async confirmUserEmail(
    @Body() body: ToBackendConfirmUserEmailRequestDto
  ): Promise<BackendResultForOperation<'confirmUserEmail'>> {
    return Result.pipe(
      Result.succeed({
        traceId: body.traceId,
        emailVerificationToken: body.input.emailVerificationToken
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
        checkUserPasswordHashIsDefined({
          user: v.user
        })
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
      Result.bind('isVerifyEmail', v =>
        Result.succeed(v.user.isEmailVerified === false)
      ),
      Result.andThrough(async v => {
        if (v.isVerifyEmail === false) {
          return Result.succeed();
        }

        v.user.isEmailVerified = true;

        return this.db.write({
          insertOrUpdate: {
            users: [v.user]
          }
        });
      }),
      Result.map(
        (v): ToBackendConfirmUserEmailOutput =>
          v.isVerifyEmail
            ? {
                token: this.jwtService.sign({ userId: v.user.userId }),
                user: userTabToApi({
                  user: v.user
                })
              }
            : {}
      )
    );
  }
}
