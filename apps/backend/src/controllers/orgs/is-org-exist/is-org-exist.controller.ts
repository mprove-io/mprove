import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class IsOrgExistController {
  constructor(private orgsRepository: repositories.OrgsRepository) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsOrgExist)
  async isOrgExist(
    @ValidateRequest(apiToBackend.ToBackendIsOrgExistRequest)
    reqValid: apiToBackend.ToBackendIsOrgExistRequest
  ) {
    let { name } = reqValid.payload;

    let org = await this.orgsRepository.findOne({
      name: name
    });

    let payload: apiToBackend.ToBackendIsOrgExistResponsePayload = {
      isExist: common.isDefined(org)
    };

    return payload;
  }
}
