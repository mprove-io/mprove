import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { OrgEntity } from '~backend/models/store-entities/org.entity';
import { DbService } from './db.service';
import { RabbitService } from './rabbit.service';

@Injectable()
export class OrgsService {
  constructor(
    private orgsRepository: repositories.OrgsRepository,
    private rabbitService: RabbitService,
    private dbService: DbService
  ) {}

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
        message: apiToBackend.ErEnum.BACKEND_ONLY_ORG_OWNER_CAN_ACCESS
      });
    }

    return;
  }

  async addOrg(item: {
    ownerId: string;
    ownerEmail: string;
    name: string;
    traceId: string;
    orgId?: string;
  }) {
    let { ownerId, ownerEmail, name, traceId, orgId } = item;

    let newOrg = maker.makeOrg({
      name: name,
      ownerId: ownerId,
      ownerEmail: ownerEmail,
      orgId: orgId
    });

    let createOrgRequest: apiToDisk.ToDiskCreateOrgRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
        traceId: traceId
      },
      payload: {
        orgId: newOrg.org_id
      }
    };

    await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateOrgResponse>({
      routingKey: helper.makeRoutingKeyToDisk({
        orgId: newOrg.org_id,
        projectId: undefined
      }),
      message: createOrgRequest,
      checkIsOk: true
    });

    let records = await this.dbService.writeRecords({
      modify: false,
      records: {
        orgs: [newOrg]
      }
    });

    return records.orgs[0];
  }
}
