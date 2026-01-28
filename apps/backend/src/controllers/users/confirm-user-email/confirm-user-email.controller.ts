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
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendConfirmUserEmailRequest,
  ToBackendConfirmUserEmailResponsePayload
} from '#common/interfaces/to-backend/users/to-backend-confirm-user-email';
import { ServerError } from '#common/models/server-error';
import { BackendConfig } from '~backend/config/backend-config';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DconfigsService } from '~backend/services/db/dconfigs.service';
import { MembersService } from '~backend/services/db/members.service';
import { UsersService } from '~backend/services/db/users.service';
import { HashService } from '~backend/services/hash.service';
import { TabService } from '~backend/services/tab.service';

let retry = require('async-retry');

@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard, ValidateRequestGuard)
@Controller()
export class ConfirmUserEmailController {
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

  @Post(ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail)
  async confirmUserEmail(@Req() request: any) {
    let reqValid: ToBackendConfirmUserEmailRequest = request.body;

    let { traceId } = reqValid.info;
    let { emailVerificationToken } = reqValid.payload;

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

    if (isUndefined(user.passwordHash)) {
      throw new ServerError({
        message: ErEnum.BACKEND_SIGN_UP_TO_SET_PASSWORD
      });
    }

    await this.membersService.addMemberToDemoProject({
      traceId: traceId,
      user: user
    });

    let payload: ToBackendConfirmUserEmailResponsePayload = {};

    if (user.isEmailVerified === false) {
      user.isEmailVerified = true;

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
    }

    return payload;
  }
}
