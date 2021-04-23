import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class GetAvatarBigController {
  constructor(private avatarsRepository: repositories.AvatarsRepository) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig)
  async getAvatarBig(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetAvatarBigRequest)
    reqValid: apiToBackend.ToBackendGetAvatarBigRequest
  ) {
    let { avatarUserId } = reqValid.payload;

    let avatar = await this.avatarsRepository.findOne({
      user_id: avatarUserId
    });

    let payload: apiToBackend.ToBackendGetAvatarBigResponsePayload = {
      avatarSmall: avatar?.avatar_small,
      avatarBig: avatar?.avatar_big
    };

    return payload;
  }
}
