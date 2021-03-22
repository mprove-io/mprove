import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { common } from '~api-to-backend/barrels/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class SetAvatarController {
  constructor(
    private avatarsRepository: repositories.AvatarsRepository,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetAvatar)
  async setAvatar(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSetAvatarRequest)
    reqValid: apiToBackend.ToBackendSetAvatarRequest
  ) {
    let { avatarSmall, avatarBig } = reqValid.payload;

    let avatar: entities.AvatarEntity;

    avatar = await this.avatarsRepository.findOne({
      user_id: user.user_id
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

    let records: interfaces.Records;

    await this.connection.transaction(async manager => {
      records = await db.modifyRecords({
        manager: manager,
        records: {
          avatars: [avatar]
        }
      });
    });

    let payload: apiToBackend.ToBackendSetAvatarResponsePayload = {
      avatarSmall: records.avatars[0].avatar_small
    };

    return payload;
  }
}
