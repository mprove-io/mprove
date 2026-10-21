import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendCompleteUserRegistrationRequestDto,
  ToBackendCompleteUserRegistrationResponseDto
} from '#backend/controllers/users/complete-user-registration/complete-user-registration.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { DbService } from '#backend/services/db/db.service';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { UsersService } from '#backend/services/db/users/users.service';
import {
  type CreateSaltAndHashOutput,
  HashService
} from '#backend/services/hash/hash.service';
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
    private dconfigsService: DconfigsService,
    private jwtService: JwtService,
    private hashService: HashService,
    private usersService: UsersService,
    private membersService: MembersService,
    private db: DbService
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
        isDefined(v.user.passwordHash) || v.user.isEmailVerified === true
          ? Result.fail({ code: 'BACKEND_USER_ALREADY_REGISTERED' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.membersService.addMemberToDemoProject({
          traceId: v.traceId,
          user: v.user
        })
      ),
      Result.map(v => {
        v.user.isEmailVerified = true;

        return v;
      }),
      Result.bind('newPasswordHS', async v => {
        let newPasswordHS: CreateSaltAndHashOutput =
          await this.hashService.createSaltAndHash({ input: v.newPassword });

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
          user: this.usersService.tabToApi({ user: v.user })
        })
      )
    );
  }
}
