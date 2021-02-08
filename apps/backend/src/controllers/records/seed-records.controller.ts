import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { db } from '~backend/barrels/db';
import { decorators } from '~backend/barrels/decorators';
import { entities } from '~backend/barrels/entities';
import { gen } from '~backend/barrels/gen';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { UsersService } from '~backend/services/users.service';

@decorators.Public()
@Controller()
export class SeedRecordsController {
  constructor(
    private usersService: UsersService,
    private connection: Connection,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords)
  async seedRecords(@Body() body) {
    try {
      let reqValid = await common.transformValid({
        classType: apiToBackend.ToBackendSeedRecordsRequest,
        object: body,
        errorMessage: apiToBackend.ErEnum.BACKEND_WRONG_REQUEST_PARAMS
      });

      let payloadUsers = reqValid.payload.users;

      //

      let users: entities.UserEntity[] = [];

      if (helper.isDefined(payloadUsers)) {
        await asyncPool(
          1,
          payloadUsers,
          async (x: apiToBackend.ToBackendSeedRecordsRequestPayloadUsers) => {
            let alias = await this.usersService.makeAlias(x.email);
            let { salt, hash } = helper.isDefined(x.password)
              ? await this.usersService.makeSaltAndHash(x.password)
              : { salt: undefined, hash: undefined };

            let newUser = gen.makeUser({
              userId: x.userId,
              email: x.email,
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

      let payload: apiToBackend.ToBackendSeedRecordsResponse['payload'] = {};

      return common.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
