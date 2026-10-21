import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendConfirmUserEmailRequestDto,
  ToBackendConfirmUserEmailResponseDto
} from '#backend/controllers/users/confirm-user-email/confirm-user-email.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { DbService } from '#backend/services/db/db.service';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { HashService } from '#backend/services/hash/hash.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendConfirmUserEmailOutput } from '#common/types/backend/routes/users/confirm-user-email/confirm-user-email-output';

@ApiTags('Users')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Controller()
export class ConfirmUserEmailController {
  constructor(
    private dconfigsService: DconfigsService,
    private jwtService: JwtService,
    private hashService: HashService,
    private usersService: UsersService,
    private membersService: MembersService,
    private db: DbService
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
      Result.bind('hashSecret', v =>
        this.dconfigsService.getDconfigHashSecret()
      ),
      Result.bind('emailVerificationTokenHash', v =>
        this.hashService.makeHash({
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
        this.usersService.checkUserPasswordHashIsDefined({ user: v.user })
      ),
      Result.andThrough(v =>
        this.membersService.addMemberToDemoProject({
          traceId: v.traceId,
          user: v.user
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
                user: this.usersService.tabToApi({ user: v.user })
              }
            : {}
      )
    );
  }
}
