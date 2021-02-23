import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';
import { UsersService } from '~backend/services/users.service';

@SkipJwtCheck()
@Controller()
export class RegisterUserController {
  constructor(
    private usersService: UsersService,
    private connection: Connection,
    private cs: ConfigService<interfaces.Config>,
    private mailerService: MailerService,
    private userRepository: repositories.UsersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRegisterUser)
  async registerUser(
    @ValidateRequest(apiToBackend.ToBackendRegisterUserRequest)
    reqValid: apiToBackend.ToBackendRegisterUserRequest
  ) {
    let { email, password } = reqValid.payload;

    let newUser: entities.UserEntity;

    let { salt, hash } = await this.usersService.makeSaltAndHash(password);

    let user = await this.userRepository.findOne({ email: email });

    if (common.isDefined(user)) {
      if (common.isDefined(user.hash)) {
        throw new common.ServerError({
          message: apiToBackend.ErEnum.BACKEND_USER_ALREADY_REGISTERED
        });
      } else {
        user.hash = hash;
        user.salt = salt;
        await this.connection.transaction(async manager => {
          await db.modifyRecords({
            manager: manager,
            records: {
              users: [user]
            }
          });
        });
      }
    }

    if (common.isUndefined(user)) {
      let onlyInv = this.cs.get<interfaces.Config['registerOnlyInvitedUsers']>(
        'registerOnlyInvitedUsers'
      );

      if (onlyInv === common.BoolEnum.TRUE) {
        throw new common.ServerError({
          message: apiToBackend.ErEnum.BACKEND_USER_IS_NOT_INVITED
        });
      } else {
        let alias = await this.usersService.makeAlias(email);

        newUser = maker.makeUser({
          email: email,
          isEmailVerified: common.BoolEnum.FALSE,
          hash: hash,
          salt: salt,
          alias: alias
        });

        await this.connection.transaction(async manager => {
          await db.addRecords({
            manager: manager,
            records: {
              users: [newUser]
            }
          });
        });

        let hostUrl = this.cs.get<interfaces.Config['hostUrl']>('hostUrl');

        let link = `${hostUrl}/confirm-email?token=${newUser.email_verification_token}`;

        await this.mailerService.sendMail({
          to: email,
          subject: '[Mprove] Verify your email',
          text: `Click the link to complete email verification: ${link}`
        });
      }
    }

    let payload: apiToBackend.ToBackendRegisterUserResponsePayload = {
      userId: newUser.user_id
    };

    return payload;
  }
}
