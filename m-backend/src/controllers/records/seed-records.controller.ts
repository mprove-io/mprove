import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { Connection } from 'typeorm';
import { api } from '~/barrels/api';
import { constants } from '~/barrels/constants';
import { db } from '~/barrels/db';
import { entities } from '~/barrels/entities';
import { gen } from '~/barrels/gen';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { UsersService } from '~/services/users.service';

@Controller()
export class SeedRecordsController {
  constructor(
    private usersService: UsersService,
    private connection: Connection,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(api.ToBackendRequestInfoNameEnum.ToBackendSeedRecords)
  async seedRecords(@Body() body) {
    try {
      let reqValid = await api.transformValid({
        classType: api.ToBackendSeedRecordsRequest,
        object: body,
        errorMessage: api.ErEnum.M_BACKEND_WRONG_REQUEST_PARAMS
      });

      let payloadUsers = reqValid.payload.users;

      //

      let users: entities.UserEntity[] = [];

      if (helper.isDefined(payloadUsers)) {
        await asyncPool(
          1,
          payloadUsers,
          async (x: api.ToBackendSeedRecordsRequestPayloadUsers) => {
            let alias = await this.usersService.makeAlias(x.userId);
            let { salt, hash } = this.usersService.makeSaltAndHash(x.password);

            let newUser = gen.makeUser({
              userId: x.userId,
              isEmailVerified: x.isEmailVerified,
              emailVerificationToken: x.emailVerificationToken,
              passwordResetToken: x.passwordResetToken,
              hash: hash,
              salt: salt,
              alias: alias,
              passwordResetExpiresTs: helper.isDefined(x.passwordResetToken)
                ? helper.makeTsUsingOffsetFromNow(
                    constants.PASSWORD_EXPIRES_OFFSET
                  )
                : undefined
            });

            users.push(newUser);
          }
        );
      }

      await this.connection.transaction(async manager => {
        await db.addRecords({
          manager: manager,
          records: {
            users: users
          }
        });
      });

      let payload: api.ToBackendSeedRecordsResponse['payload'] = {};

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
