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
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendUpdateUserPasswordRequestDto,
  ToBackendUpdateUserPasswordResponseDto
} from '#backend/controllers/users/update-user-password/update-user-password.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { makeTsNumber } from '#backend/functions/make-ts-number';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip.guard';
import { DconfigsService } from '#backend/services/db/dconfigs.service';
import { HashService } from '#backend/services/hash.service';
import { TabService } from '#backend/services/tab.service';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';

@ApiTags('Users')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Controller()
export class UpdateUserPasswordController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword)
  @ApiOperation({
    summary: 'UpdateUserPassword',
    description: 'Set a new password using a valid reset token'
  })
  @ApiOkResponse({
    type: ToBackendUpdateUserPasswordResponseDto
  })
  async updateUserPassword(
    @Body() body: ToBackendUpdateUserPasswordRequestDto
  ) {
    let { passwordResetToken, newPassword } = body.payload;

    let hashSecret = await this.dconfigsService.getDconfigHashSecret();

    let passwordResetTokenHash = this.hashService.makeHash({
      input: passwordResetToken,
      hashSecret: hashSecret
    });

    let user = await this.db.drizzle.query.usersTable
      .findFirst({
        where: eq(usersTable.passwordResetTokenHash, passwordResetTokenHash)
      })
      .then(x => this.tabService.userEntToTab(x));

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_UPDATE_PASSWORD_WRONG_TOKEN
      });
    }

    if (user.passwordResetExpiresTs < makeTsNumber()) {
      throw new ServerError({
        message: ErEnum.BACKEND_UPDATE_PASSWORD_TOKEN_EXPIRED
      });
    }

    let passwordHS = await this.hashService.createSaltAndHash({
      input: newPassword
    });

    user.passwordHash = passwordHS.hash;
    user.passwordSalt = passwordHS.salt;
    user.passwordResetExpiresTs = 1;
    user.jwtMinIat = makeTsNumber();

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

    let payload = {};

    return payload;
  }
}
