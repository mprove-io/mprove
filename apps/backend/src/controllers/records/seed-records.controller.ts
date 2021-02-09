import { Controller, Post } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { gen } from '~backend/barrels/gen';
import { helper } from '~backend/barrels/helper';
import { Public, ValidateRequest } from '~backend/decorators/_index';
import { UsersService } from '~backend/services/users.service';

@Public()
@Controller()
export class SeedRecordsController {
  constructor(
    private usersService: UsersService,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords)
  async seedRecords(
    @ValidateRequest(apiToBackend.ToBackendSeedRecordsRequest)
    reqValid: apiToBackend.ToBackendSeedRecordsRequest
  ) {
    let payloadUsers = reqValid.payload.users;

    //

    let users: entities.UserEntity[] = [];

    if (common.isDefined(payloadUsers)) {
      await asyncPool(
        1,
        payloadUsers,
        async (x: apiToBackend.ToBackendSeedRecordsRequestPayloadUsers) => {
          let alias = await this.usersService.makeAlias(x.email);
          let { salt, hash } = common.isDefined(x.password)
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
            passwordResetExpiresTs: common.isDefined(x.passwordResetToken)
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

    return payload;
  }
}
