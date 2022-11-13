import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';

@UseGuards(ValidateRequestGuard)
@Controller()
export class IsOrgExistController {
  constructor(private orgsRepository: repositories.OrgsRepository) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsOrgExist)
  async isOrgExist(@Req() request: any) {
    let reqValid: apiToBackend.ToBackendIsOrgExistRequest = request.body;

    let { name } = reqValid.payload;

    let org = await this.orgsRepository.findOne({ where: { name: name } });

    let payload: apiToBackend.ToBackendIsOrgExistResponsePayload = {
      isExist: common.isDefined(org)
    };

    return payload;
  }
}
