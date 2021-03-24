import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { UsersService } from '~backend/services/users.service';

@Controller()
export class UpdateUserPasswordController {
  constructor(
    private dbService: DbService,
    private usersService: UsersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword)
  async updateUserPassword(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendUpdateUserPasswordRequest)
    reqValid: apiToBackend.ToBackendUpdateUserPasswordRequest
  ) {
    let { passwordResetToken, newPassword } = reqValid.payload;

    if (user.password_reset_token !== passwordResetToken) {
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
