import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { SkipJwtCheck } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DbService } from '~backend/services/db.service';
import { UsersService } from '~backend/services/users.service';

@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class UpdateUserPasswordController {
  constructor(
    private dbService: DbService,
    private usersService: UsersService,
    private usersRepository: repositories.UsersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword)
  async updateUserPassword(@Req() request: any) {
    let reqValid: apiToBackend.ToBackendUpdateUserPasswordRequest =
      request.body;

    let { passwordResetToken, newPassword } = reqValid.payload;

    let user = await this.usersRepository.findOne({
      where: {
        password_reset_token: passwordResetToken
      }
    });

    if (common.isUndefined(user)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_UPDATE_PASSWORD_WRONG_TOKEN
      });
    }

    if (Number(user.password_reset_expires_ts) < Number(helper.makeTs())) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_UPDATE_PASSWORD_TOKEN_EXPIRED
      });
    }

    let { salt, hash } = await this.usersService.makeSaltAndHash(newPassword);

    user.hash = hash;
    user.salt = salt;
    user.password_reset_expires_ts = (1).toString();
    user.jwt_min_iat = helper.makeTs();

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
