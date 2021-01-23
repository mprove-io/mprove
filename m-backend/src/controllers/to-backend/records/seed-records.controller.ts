import { api } from '../../../barrels/api';
import { UsersService } from '../../../services/users.service';

import { Body, Controller, Post } from '@nestjs/common';
import { helper } from '../../../barrels/helper';
import asyncPool from 'tiny-async-pool';
import { RabbitService } from '../../../services/rabbit.service';
import { entities } from '../../../barrels/entities';
import { gen } from '../../../barrels/gen';
import { constants } from '../../../barrels/constants';
import { Connection } from 'typeorm';
import { db } from '../../../barrels/db';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../../../barrels/interfaces';

@Controller()
export class ToBackendSeedRecordsController {
  constructor(
    private usersService: UsersService,
    private connection: Connection,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(api.ToBackendRequestInfoNameEnum.ToBackendSeedRecords)
  async toBackendSeedRecords(@Body() body) {
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
        await db.insertRecords({
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
