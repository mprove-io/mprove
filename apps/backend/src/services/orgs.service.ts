import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { OrgEntity } from '~backend/models/store-entities/org.entity';

@Injectable()
export class OrgsService {
  constructor(private orgsRepository: repositories.OrgsRepository) {}

  async getOrgCheckExists(item: { orgId: string }) {
    let { orgId } = item;

    let org = await this.orgsRepository.findOne({ org_id: orgId });

    if (common.isUndefined(org)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_ORG_DOES_NOT_EXIST
      });
    }

    return org;
  }

  async checkUserIsOrgOwner(item: { userId: string; org: OrgEntity }) {
    let { org, userId } = item;

    if (org.owner_id !== userId) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_ORG
      });
    }

    return;
  }
}
