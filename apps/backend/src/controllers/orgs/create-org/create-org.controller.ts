import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class CreateOrgController {
  constructor(
    private connection: Connection,
    private rabbitService: RabbitService,
    private orgsRepository: repositories.OrgsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateOrg)
  async createOrg(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateOrgRequest)
    reqValid: apiToBackend.ToBackendCreateOrgRequest
  ) {
    let { name } = reqValid.payload;

    let org = await this.orgsRepository.findOne({ name: name });

    if (common.isDefined(org)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_ORG_ALREADY_EXISTS
      });
    }

    let newOrg = maker.makeOrg({
      name: name,
      ownerId: user.user_id,
      ownerEmail: user.email
    });

    let createOrgRequest: apiToDisk.ToDiskCreateOrgRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
        traceId: reqValid.info.traceId
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

    let records: interfaces.Records;

    await this.connection.transaction(async manager => {
      records = await db.addRecords({
        manager: manager,
        records: {
          orgs: [newOrg]
        }
      });
    });

    let payload: apiToBackend.ToBackendCreateOrgResponsePayload = {
      org: wrapper.wrapToApiOrg(records.orgs[0])
    };

    return payload;
  }
}
