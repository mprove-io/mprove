import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MconfigsService } from '~backend/services/mconfigs.service';

@Controller()
export class GetMconfigController {
  constructor(private mconfigsService: MconfigsService) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMconfig)
  async getMconfig(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetMconfigRequest)
    reqValid: apiToBackend.ToBackendGetMconfigRequest
  ) {
    let { mconfigId } = reqValid.payload;

    let mconfig = await this.mconfigsService.getMconfigCheckExists({
      mconfigId: mconfigId
    });

    let payload: apiToBackend.ToBackendGetMconfigResponsePayload = {
      mconfig: wrapper.wrapToApiMconfig(mconfig)
    };

    return payload;
  }
}
