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
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { UsersService } from '~backend/services/db/users.service';
import { EmailService } from '~backend/services/email.service';
import { HashService } from '~backend/services/hash.service';
import { DEFAULT_SRV_UI } from '~common/constants/top-backend';
import { BoolEnum } from '~common/enums/bool.enum';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendRegisterUserRequest,
  ToBackendRegisterUserResponsePayload
} from '~common/interfaces/to-backend/users/to-backend-register-user';
import { ServerError } from '~common/models/server-error';

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
  '60s': {
    limit: 10 * 2,
    blockDuration: seconds(24 * 60 * 60) // 24h
  },
  '600s': {
    limit: 30 * 2,
    blockDuration: seconds(24 * 60 * 60) // 24h
  }
})
@Controller()
export class RegisterUserController {
  constructor(
    private hashService: HashService,
    private usersService: UsersService,
    private emailService: EmailService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRegisterUser)
  async registerUser(@Req() request: any) {
    let reqValid: ToBackendRegisterUserRequest = request.body;

    let { email, password } = reqValid.payload;

    let newUser: UserTab;

    let { salt, hash } = await this.hashService.createSaltAndHash(password);

    let emailHash = this.hashService.makeHash(email);

    let user = await this.db.drizzle.query.usersTable
      .findFirst({
        where: eq(usersTable.emailHash, emailHash)
      })
      .then(x => this.usersService.entToTab(x));

    if (isDefined(user)) {
      if (isDefined(user.hash) && user.isEmailVerified === true) {
        throw new ServerError({
          message: ErEnum.BACKEND_USER_ALREADY_REGISTERED
        });
      } else {
        user.hash = hash;
        user.salt = salt;

        newUser = user;
      }
    }

    if (isUndefined(user)) {
      let onlyInv = this.cs.get<BackendConfig['registerOnlyInvitedUsers']>(
        'registerOnlyInvitedUsers'
      );

      if (onlyInv === BoolEnum.TRUE) {
        throw new ServerError({
          message: ErEnum.BACKEND_USER_IS_NOT_INVITED
        });
      } else {
        let alias = await this.usersService.makeAlias(email);

        newUser = {
          userId: makeId(),
          email: email,
          passwordResetToken: undefined,
          passwordResetExpiresTs: undefined,
          isEmailVerified: false,
          emailVerificationToken: makeId(),
          hash: hash,
          salt: salt,
          jwtMinIat: undefined,
          alias: alias,
          firstName: undefined,
          lastName: undefined,
          ui: makeCopy(DEFAULT_SRV_UI),
          emailHash: undefined, // tab-to-ent
          aliasHash: undefined, // tab-to-ent
          passwordResetTokenHash: undefined, // tab-to-ent
          emailVerificationTokenHash: undefined, // tab-to-ent
          serverTs: undefined
        };
      }
    }

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                users: isDefined(user) ? [] : [newUser]
              },
              insertOrUpdate: {
                users: isDefined(user) ? [newUser] : []
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    await this.emailService.sendVerification({
      email: email,
      emailVerificationToken: newUser.emailVerificationToken
    });

    let payload: ToBackendRegisterUserResponsePayload = {
      user: this.usersService.tabToApi({ user: newUser })
    };

    return payload;
  }
}
