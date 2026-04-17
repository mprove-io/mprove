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
import { seconds, Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendResetUserPasswordRequestDto,
  ToBackendResetUserPasswordResponseDto
} from '#backend/controllers/users/reset-user-password/reset-user-password.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { makeTsUsingOffsetFromNow } from '#backend/functions/make-ts-using-offset-from-now';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip.guard';
import { UsersService } from '#backend/services/db/users.service';
import { EmailService } from '#backend/services/email.service';
import { TabService } from '#backend/services/tab.service';
import { PATH_UPDATE_PASSWORD } from '#common/constants/top';
import {
  PASSWORD_EXPIRES_OFFSET,
  THROTTLE_MULTIPLIER
} from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';

@ApiTags('Users')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Throttle({
  '1s': {
    limit: 2 * THROTTLE_MULTIPLIER
  },
  '5s': {
    limit: 3 * THROTTLE_MULTIPLIER
  },
  // '60s': {
  //   limit: 5 * THROTTLE_MULTIPLIER,
  //   blockDuration: seconds(1 * 60 * 60)
  // },
  '24h': {
    limit: 10 * THROTTLE_MULTIPLIER,
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
  @ApiOperation({
    summary: 'ResetUserPassword',
    description: 'Email a password reset link with a token'
  })
  @ApiOkResponse({
    type: ToBackendResetUserPasswordResponseDto
  })
  async resetUserPassword(@Body() body: ToBackendResetUserPasswordRequestDto) {
    let { email } = body.payload;

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

    let hostUrl = this.cs
      .get<BackendConfig['hostUrl']>('hostUrl')
      .split(',')[0];

    let urlUpdatePassword = `${hostUrl}/${PATH_UPDATE_PASSWORD}?token=${user.passwordResetToken}`;

    await this.emailService.sendResetPassword({
      user: user,
      urlUpdatePassword: urlUpdatePassword
    });

    let payload = {};

    return payload;
  }
}
