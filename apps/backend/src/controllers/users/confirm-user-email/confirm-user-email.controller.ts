import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { repositories } from '~backend/barrels/repositories';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';

@SkipJwtCheck()
@Controller()
export class ConfirmUserEmailController {
  constructor(
    private userRepository: repositories.UsersRepository,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail)
  async confirmUserEmail(
    @ValidateRequest(apiToBackend.ToBackendConfirmUserEmailRequest)
    reqValid: apiToBackend.ToBackendConfirmUserEmailRequest
  ) {
    let { token } = reqValid.payload;

    let user = await this.userRepository.findOne({
      email_verification_token: token
    });

    if (common.isUndefined(user)) {
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

    return payload;
  }
}
