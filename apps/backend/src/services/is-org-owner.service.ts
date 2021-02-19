import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class IsOrgOwnerService {
  constructor(private orgsRepository: repositories.OrgsRepository) {}

  async getOrg(item: { userId: string; orgId: string }) {
    let { orgId, userId } = item;

    let org = await this.orgsRepository.findOne({
      org_id: orgId
    });

    if (common.isUndefined(org)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_ORG_NOT_FOUND
      });
    }

    if (org.owner_id !== userId) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_ORG
      });
    }

    return org;
  }
}
