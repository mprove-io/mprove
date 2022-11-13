import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetAvatarBigController {
  constructor(private avatarsRepository: repositories.AvatarsRepository) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig)
  async getAvatarBig(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetAvatarBigRequest = request.body;

    let { avatarUserId } = reqValid.payload;

    let avatar = await this.avatarsRepository.findOne({
      where: {
        user_id: avatarUserId
      }
    });

    let payload: apiToBackend.ToBackendGetAvatarBigResponsePayload = {
      avatarSmall: avatar?.avatar_small,
      avatarBig: avatar?.avatar_big
    };

    return payload;
  }
}
