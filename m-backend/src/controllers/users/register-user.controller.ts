import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { api } from '~/barrels/api';
import { db } from '~/barrels/db';
import { gen } from '~/barrels/gen';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { repositories } from '~/barrels/repositories';
import { UsersService } from '~/services/users.service';

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
        errorMessage: api.ErEnum.M_BACKEND_WRONG_REQUEST_PARAMS
      });

      let { userId, password } = reqValid.payload;

      let { salt, hash } = this.usersService.makeSaltAndHash(password);

      let user = await this.userRepository.findOne(userId);

      if (helper.isDefined(user)) {
        if (helper.isDefined(user.hash)) {
          throw new api.ServerError({
            message: api.ErEnum.M_BACKEND_USER_ALREADY_REGISTERED
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
            message: api.ErEnum.M_BACKEND_USER_IS_NOT_INVITED
          });
        } else {
          let alias = await this.usersService.makeAlias(userId);

          let newUser = gen.makeUser({
            userId: userId,
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
            to: userId,
            subject: '[Mprove] Verify your email',
            text: `Click the link to complete email verification: ${link}`
          });
        }
      }

      let payload: api.ToBackendRegisterUserResponsePayload = {
        userId: userId
      };

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
