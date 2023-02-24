import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DbService } from '~backend/services/db.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class SetUserUiController {
  constructor(private dbService: DbService) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserUi)
  async setUserUi(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSetUserUiRequest = request.body;

    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { ui } = reqValid.payload;

    user.ui = ui;

    await this.dbService.writeRecords({
      modify: true,
      records: {
        users: [user]
      }
    });

    let payload: apiToBackend.ToBackendSetUserUiResponsePayload = {
      user: wrapper.wrapToApiUser(user)
    };

    return payload;
  }
}
