import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCompleteUserRegistrationRequestDto,
  ToBackendCompleteUserRegistrationResponseDto
} from '#backend/controllers/users/complete-user-registration/complete-user-registration.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip.guard';
import { DconfigsService } from '#backend/services/db/dconfigs.service';
import { MembersService } from '#backend/services/db/members.service';
import { UsersService } from '#backend/services/db/users.service';
import { HashService } from '#backend/services/hash.service';
import { TabService } from '#backend/services/tab.service';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendConfirmUserEmailResponsePayload } from '#common/zod/to-backend/users/to-backend-confirm-user-email';

@ApiTags('Users')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Controller()
export class CompleteUserRegistrationController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private jwtService: JwtService,
    private hashService: HashService,
    private usersService: UsersService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCompleteUserRegistration)
  @ApiOperation({
    summary: 'CompleteUserRegistration',
    description: 'Verify email, set password and finish registration'
  })
  @ApiOkResponse({
    type: ToBackendCompleteUserRegistrationResponseDto
  })
  async completeUserRegistration(
    @Body() body: ToBackendCompleteUserRegistrationRequestDto
  ) {
    let { traceId } = body.info;
    let { emailVerificationToken, newPassword } = body.payload;

    let hashSecret = await this.dconfigsService.getDconfigHashSecret();

    let emailVerificationTokenHash = this.hashService.makeHash({
      input: emailVerificationToken,
      hashSecret: hashSecret
    });

    let user = await this.db.drizzle.query.usersTable
      .findFirst({
        where: eq(
          usersTable.emailVerificationTokenHash,
          emailVerificationTokenHash
        )
      })
      .then(x => this.tabService.userEntToTab(x));

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    if (isDefined(user.passwordHash) || user.isEmailVerified === true) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_ALREADY_REGISTERED
      });
    }

    await this.membersService.addMemberToDemoProject({
      traceId: traceId,
      user: user
    });

    let payload: ToBackendConfirmUserEmailResponsePayload = {};

    user.isEmailVerified = true;

    let newPasswordHS = await this.hashService.createSaltAndHash({
      input: newPassword
    });

    user.passwordHash = newPasswordHS.hash;
    user.passwordSalt = newPasswordHS.salt;
    user.passwordResetExpiresTs = 1;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                users: [user]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let token = this.jwtService.sign({ userId: user.userId });

    payload = {
      token: token,
      user: this.usersService.tabToApi({ user: user })
    };

    return payload;
  }
}
