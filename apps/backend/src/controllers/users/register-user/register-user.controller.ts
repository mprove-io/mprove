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
import { SkipJwtCheck } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EmailService } from '~backend/services/email.service';
import { UsersService } from '~backend/services/users.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

let retry = require('async-retry');

@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class RegisterUserController {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRegisterUser)
  async registerUser(@Req() request: any) {
    let reqValid: ToBackendRegisterUserRequest = request.body;

    let { email, password } = reqValid.payload;

    let newUser: UserEnt;

    let { salt, hash } = await this.usersService.makeSaltAndHash(password);

    let user = await this.db.drizzle.query.usersTable.findFirst({
      where: eq(usersTable.email, email)
    });

    if (isDefined(user)) {
      if (isDefined(user.hash)) {
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
          serverTs: undefined
        };

        // newUser = maker.makeUser({
        //   email: email,
        //   isEmailVerified: false,
        //   hash: hash,
        //   salt: salt,
        //   alias: alias
        // });
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

    await this.emailService.sendEmailVerification({
      email: email,
      emailVerificationToken: newUser.emailVerificationToken
    });

    let payload: ToBackendRegisterUserResponsePayload = {
      user: this.wrapToApiService.wrapToApiUser(newUser)
    };

    return payload;
  }
}
