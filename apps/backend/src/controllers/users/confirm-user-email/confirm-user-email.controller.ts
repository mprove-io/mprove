import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';

@SkipJwtCheck()
@Controller()
export class ConfirmUserEmailController {
  constructor(
    private userRepository: repositories.UsersRepository,
    private dbService: DbService
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

      await this.dbService.writeRecords({
        modify: true,
        records: {
          users: [user]
        }
      });
    }

    let payload = {};

    return payload;
  }
}
