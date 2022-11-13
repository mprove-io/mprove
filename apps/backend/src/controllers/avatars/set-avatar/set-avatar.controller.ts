import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { common } from '~api-to-backend/barrels/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DbService } from '~backend/services/db.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class SetAvatarController {
  constructor(
    private avatarsRepository: repositories.AvatarsRepository,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetAvatar)
  async setAvatar(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSetAvatarRequest = request.body;

    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { avatarSmall, avatarBig } = reqValid.payload;

    let avatar: entities.AvatarEntity;

    avatar = await this.avatarsRepository.findOne({
      where: {
        user_id: user.user_id
      }
    });

    if (common.isDefined(avatar)) {
      avatar.avatar_small = avatarSmall;
      avatar.avatar_big = avatarBig;
    } else {
      avatar = maker.makeAvatar({
        userId: user.user_id,
        avatarSmall: avatarSmall,
        avatarBig: avatarBig
      });
    }

    await this.dbService.writeRecords({
      modify: true,
      records: {
        avatars: [avatar]
      }
    });

    let payload: apiToBackend.ToBackendSetAvatarResponsePayload = {
      avatarSmall: avatar.avatar_small,
      avatarBig: avatar.avatar_big
    };

    return payload;
  }
}
