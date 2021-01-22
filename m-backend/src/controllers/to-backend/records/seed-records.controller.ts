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

@Controller()
export class ToBackendSeedRecordsController {
  constructor(
    private usersService: UsersService,
    private connection: Connection
  ) {}

  @Post(api.ToBackendRequestInfoNameEnum.ToBackendSeedRecords)
  async toBackendSeedRecords(
    @Body() body: api.ToBackendSeedRecordsRequest
  ): Promise<api.ToBackendSeedRecordsResponse | api.ErrorResponse> {
    try {
      let requestValid = await api.transformValid({
        classType: api.ToBackendSeedRecordsRequest,
        object: body,
        errorMessage: api.ErEnum.M_BACKEND_WRONG_REQUEST_PARAMS
      });

      let { traceId } = requestValid.info;
      let payloadUsers = requestValid.payload.users;

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

      let response: api.ToBackendSeedRecordsResponse = {
        info: {
          status: api.ResponseInfoStatusEnum.Ok,
          traceId: traceId
        },
        payload: {}
      };

      return response;
    } catch (e) {
      api.handleError(e);
      return api.makeErrorResponse({ request: body, e: e });
    }
  }
}
