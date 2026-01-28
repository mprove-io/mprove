import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ToBackendUpdateUserPasswordRequest } from '#common/interfaces/to-backend/users/to-backend-update-user-password';
import { ServerError } from '#common/models/server-error';
import { BackendConfig } from '~backend/config/backend-config';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DconfigsService } from '~backend/services/db/dconfigs.service';
import { HashService } from '~backend/services/hash.service';
import { TabService } from '~backend/services/tab.service';

let retry = require('async-retry');

@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard, ValidateRequestGuard)
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
  async updateUserPassword(@Req() request: any) {
    let reqValid: ToBackendUpdateUserPasswordRequest = request.body;

    let { passwordResetToken, newPassword } = reqValid.payload;

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
