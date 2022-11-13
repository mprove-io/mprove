import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser } from '~backend/decorators/_index';

@Controller()
export class GetAvatarBigController {
  constructor(private avatarsRepository: repositories.AvatarsRepository) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig)
  async getAvatarBig(
    @AttachUser() user: entities.UserEntity
    // @ValidateRequest(apiToBackend.ToBackendGetAvatarBigRequest)
    // reqValid: apiToBackend.ToBackendGetAvatarBigRequest
  ) {
    let reqValid = common.transformValidSync({
      classType: apiToBlockml.ToBlockmlWorkerGenSqlRequest,
      object: request,
      errorMessage: common.ErEnum.BLOCKML_WORKER_WRONG_REQUEST_PARAMS,
      logIsStringify: this.cs.get<interfaces.Config['blockmlLogIsStringify']>(
        'blockmlLogIsStringify'
      ),
      pinoLogger: this.pinoLogger
    });

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
