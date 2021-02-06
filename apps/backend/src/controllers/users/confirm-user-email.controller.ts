import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
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

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail)
  async confirmUserEmail(@Body() body) {
    try {
      let reqValid = await common.transformValid({
        classType: apiToBackend.ToBackendConfirmUserEmailRequest,
        object: body,
        errorMessage: apiToBackend.ErEnum.BACKEND_WRONG_REQUEST_PARAMS
      });

      let { token } = reqValid.payload;

      let user = await this.userRepository.findOne({
        email_verification_token: token
      });

      if (helper.isUndefined(user)) {
        throw new common.ServerError({
          message: apiToBackend.ErEnum.BACKEND_USER_DOES_NOT_EXIST
        });
      }

      if (user.is_email_verified === common.BoolEnum.FALSE) {
        user.is_email_verified = common.BoolEnum.TRUE;

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

      return common.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
