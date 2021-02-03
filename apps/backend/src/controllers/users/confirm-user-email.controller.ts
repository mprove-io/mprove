import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { api } from '~backend/barrels/api';
import { db } from '~backend/barrels/db';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';

@Controller()
export class ConfirmUserEmailController {
  constructor(
    private userRepository: repositories.UserRepository,
    private connection: Connection,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(api.ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail)
  async confirmUserEmail(@Body() body) {
    try {
      let reqValid = await api.transformValid({
        classType: api.ToBackendConfirmUserEmailRequest,
        object: body,
        errorMessage: api.ErEnum.BACKEND_WRONG_REQUEST_PARAMS
      });

      let { token } = reqValid.payload;

      let user = await this.userRepository.findOne({
        email_verification_token: token
      });

      if (helper.isUndefined(user)) {
        throw new api.ServerError({
          message: api.ErEnum.BACKEND_USER_DOES_NOT_EXIST
        });
      }

      if (user.is_email_verified === api.BoolEnum.FALSE) {
        user.is_email_verified = api.BoolEnum.TRUE;

        await this.connection.transaction(async manager => {
          await db.modifyRecords({
            manager: manager,
            records: {
              users: [user]
            }
          });
        });
      }

      let payload = {};

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
