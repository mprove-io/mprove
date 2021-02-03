import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { api } from '~backend/barrels/api';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { gen } from '~backend/barrels/gen';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { UsersService } from '~backend/services/users.service';

@Controller()
export class RegisterUserController {
  constructor(
    private usersService: UsersService,
    private connection: Connection,
    private cs: ConfigService<interfaces.Config>,
    private mailerService: MailerService,
    private userRepository: repositories.UserRepository
  ) {}

  @Post(api.ToBackendRequestInfoNameEnum.ToBackendRegisterUser)
  async registerUser(@Body() body) {
    try {
      let reqValid = await api.transformValid({
        classType: api.ToBackendRegisterUserRequest,
        object: body,
        errorMessage: api.ErEnum.BACKEND_WRONG_REQUEST_PARAMS
      });

      let { email, password } = reqValid.payload;

      let newUser: entities.UserEntity;

      let { salt, hash } = await this.usersService.makeSaltAndHash(password);

      let user = await this.userRepository.findOne({ email: email });

      if (helper.isDefined(user)) {
        if (helper.isDefined(user.hash)) {
          throw new api.ServerError({
            message: api.ErEnum.BACKEND_USER_ALREADY_REGISTERED
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

      if (helper.isUndefined(user)) {
        let onlyInv = this.cs.get<
          interfaces.Config['backendRegisterOnlyInvitedUsers']
        >('backendRegisterOnlyInvitedUsers');

        if (onlyInv === api.BoolEnum.TRUE) {
          throw new api.ServerError({
            message: api.ErEnum.BACKEND_USER_IS_NOT_INVITED
          });
        } else {
          let alias = await this.usersService.makeAlias(email);

          newUser = gen.makeUser({
            email: email,
            isEmailVerified: api.BoolEnum.FALSE,
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

          let url = this.cs.get<interfaces.Config['backendVerifyEmailUrl']>(
            'backendVerifyEmailUrl'
          );

          let link = `${url}/confirm-email?token=${newUser.email_verification_token}`;

          await this.mailerService.sendMail({
            to: email,
            subject: '[Mprove] Verify your email',
            text: `Click the link to complete email verification: ${link}`
          });
        }
      }

      let payload: api.ToBackendRegisterUserResponsePayload = {
        userId: newUser.user_id
      };

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
