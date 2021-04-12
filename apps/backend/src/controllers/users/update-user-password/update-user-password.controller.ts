import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { UsersService } from '~backend/services/users.service';

@SkipJwtCheck()
@Controller()
export class UpdateUserPasswordController {
  constructor(
    private dbService: DbService,
    private usersService: UsersService,
    private usersRepository: repositories.UsersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword)
  async updateUserPassword(
    @ValidateRequest(apiToBackend.ToBackendUpdateUserPasswordRequest)
    reqValid: apiToBackend.ToBackendUpdateUserPasswordRequest
  ) {
    let { passwordResetToken, newPassword } = reqValid.payload;

    let user = await this.usersRepository.findOne({
      password_reset_token: passwordResetToken
    });

    if (common.isUndefined(user)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_UPDATE_PASSWORD_WRONG_TOKEN
      });
    }

    if (Number(user.password_reset_expires_ts) < Number(helper.makeTs())) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_UPDATE_PASSWORD_TOKEN_EXPIRED
      });
    }

    let { salt, hash } = await this.usersService.makeSaltAndHash(newPassword);

    user.hash = hash;
    user.salt = salt;
    user.password_reset_expires_ts = (1).toString();

    await this.dbService.writeRecords({
      modify: true,
      records: {
        users: [user]
      }
    });

    let payload = {};

    return payload;
  }
}
