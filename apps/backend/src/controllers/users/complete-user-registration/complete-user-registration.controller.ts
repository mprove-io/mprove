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
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { UsersService } from '~backend/services/users.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ToBackendCompleteUserRegistrationRequest } from '~common/interfaces/to-backend/users/to-backend-complete-user-registration';
import { ToBackendConfirmUserEmailResponsePayload } from '~common/interfaces/to-backend/users/to-backend-confirm-user-email';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class CompleteUserRegistrationController {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCompleteUserRegistration)
  async completeUserRegistration(@Req() request: any) {
    let reqValid: ToBackendCompleteUserRegistrationRequest = request.body;

    let { traceId } = reqValid.info;
    let { emailConfirmationToken, newPassword } = reqValid.payload;

    let user = await this.db.drizzle.query.usersTable.findFirst({
      where: eq(usersTable.emailVerificationToken, emailConfirmationToken)
    });

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    if (isDefined(user.hash) || user.isEmailVerified === true) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_ALREADY_REGISTERED
      });
    }

    await this.membersService.addMemberToFirstProject({
      traceId: traceId,
      user: user
    });

    let payload: ToBackendConfirmUserEmailResponsePayload = {};

    user.isEmailVerified = true;

    let { salt, hash } = await this.usersService.makeSaltAndHash(newPassword);

    user.hash = hash;
    user.salt = salt;
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

    payload = {
      token: this.jwtService.sign({ userId: user.userId }),
      user: this.wrapToApiService.wrapToApiUser(user)
    };

    return payload;
  }
}
