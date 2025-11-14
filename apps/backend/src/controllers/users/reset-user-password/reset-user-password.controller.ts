import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, seconds } from '@nestjs/throttler';
import { BackendConfig } from '~backend/config/backend-config';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsUsingOffsetFromNow } from '~backend/functions/make-ts-using-offset-from-now';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { UsersService } from '~backend/services/db/users.service';
import { EmailService } from '~backend/services/email.service';
import { TabService } from '~backend/services/tab.service';
import { PATH_UPDATE_PASSWORD } from '~common/constants/top';
import { PASSWORD_EXPIRES_OFFSET } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { ToBackendResetUserPasswordRequest } from '~common/interfaces/to-backend/users/to-backend-reset-user-password';

let retry = require('async-retry');

@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard, ValidateRequestGuard)
@Throttle({
  '1s': {
    limit: 2 * 2
  },
  '5s': {
    limit: 3 * 2
  },
  // '60s': {
  //   limit: 5 * 2,
  //   blockDuration: seconds(1 * 60 * 60)
  // },
  '24h': {
    limit: 10 * 2,
    blockDuration: seconds(24 * 60 * 60)
  }
})
@Controller()
export class ResetUserPasswordController {
  constructor(
    private tabService: TabService,
    private emailService: EmailService,
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendResetUserPassword)
  async resetUserPassword(@Req() request: any) {
    let reqValid: ToBackendResetUserPasswordRequest = request.body;

    let { email } = reqValid.payload;

    let user = await this.usersService.getUserByEmailCheckExists({
      email: email
    });

    this.usersService.checkUserIsNotRestricted({ user: user });

    this.usersService.checkUserPasswordHashIsDefined({ user: user });

    user.passwordResetToken = makeId();

    user.passwordResetExpiresTs = makeTsUsingOffsetFromNow(
      PASSWORD_EXPIRES_OFFSET
    );

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

    let hostUrl = this.cs.get<BackendConfig['hostUrl']>('hostUrl');

    let urlUpdatePassword = `${hostUrl}/${PATH_UPDATE_PASSWORD}?token=${user.passwordResetToken}`;

    await this.emailService.sendResetPassword({
      user: user,
      urlUpdatePassword: urlUpdatePassword
    });

    let payload = {};

    return payload;
  }
}
