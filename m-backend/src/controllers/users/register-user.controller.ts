import { helper } from '~/barrels/helper';
import { api } from '~/barrels/api';
import { UsersService } from '~/services/users.service';
import { db } from '~/barrels/db';

import { Body, Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { gen } from '~/barrels/gen';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';

@Controller()
export class RegisterUserController {
  constructor(
    private usersService: UsersService,
    private connection: Connection,
    private cs: ConfigService<interfaces.Config>
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

      // including deleted
      let user = await this.usersService.findOneById(userId);

      if (helper.isDefined(user)) {
        if (helper.isDefined(user.hash)) {
          throw new api.ServerError({
            message: api.ErEnum.M_BACKEND_USER_ALREADY_REGISTERED
          });
        } else {
          // update user
          user.hash = hash;
          user.salt = salt;
          await this.connection.transaction(async manager => {
            await db.saveRecords({
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
        }

        let alias = await this.usersService.makeAlias(userId);

        let newUser = gen.makeUser({
          userId: userId,
          isEmailVerified: api.BoolEnum.FALSE,
          hash: hash,
          salt: salt,
          alias: alias
        });

        // create user
        await this.connection.transaction(async manager => {
          await db.insertRecords({
            manager: manager,
            records: {
              users: [newUser]
            }
          });
        });
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
