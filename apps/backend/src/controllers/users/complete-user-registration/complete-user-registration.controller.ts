import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/db/members.service';
import { UsersService } from '~backend/services/db/users.service';
import { HashService } from '~backend/services/hash.service';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ToBackendCompleteUserRegistrationRequest } from '~common/interfaces/to-backend/users/to-backend-complete-user-registration';
import { ToBackendConfirmUserEmailResponsePayload } from '~common/interfaces/to-backend/users/to-backend-confirm-user-email';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard, ValidateRequestGuard)
@Controller()
export class CompleteUserRegistrationController {
  constructor(
    private jwtService: JwtService,
    private hashService: HashService,
    private usersService: UsersService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCompleteUserRegistration)
  async completeUserRegistration(@Req() request: any) {
    let reqValid: ToBackendCompleteUserRegistrationRequest = request.body;

    let { traceId } = reqValid.info;
    let { emailVerificationToken, newPassword } = reqValid.payload;

    let emailVerificationTokenHash = this.hashService.makeHash({
      input: emailVerificationToken
    });

    let user = await this.db.drizzle.query.usersTable
      .findFirst({
        where: eq(
          usersTable.emailVerificationTokenHash,
          emailVerificationTokenHash
        )
      })
      .then(x => this.usersService.entToTab(x));

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
