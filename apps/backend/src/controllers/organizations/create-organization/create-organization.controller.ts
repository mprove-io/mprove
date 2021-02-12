import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { gen } from '~backend/barrels/gen';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class CreateOrganizationController {
  constructor(
    private connection: Connection,
    private rabbitService: RabbitService,
    private orgsRepository: repositories.OrgsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateOrganization)
  async createOrganization(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateOrganizationRequest)
    reqValid: apiToBackend.ToBackendCreateOrganizationRequest
  ) {
    let { name } = reqValid.payload;

    let org = await this.orgsRepository.findOne({ name: name });

    if (common.isDefined(org)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_ORGANIZATION_ALREADY_EXIST
      });
    }

    let newOrg = gen.makeOrg({
      name: name,
      ownerId: user.user_id,
      ownerEmail: user.email
    });

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          orgs: [newOrg]
        }
      });
    });

    let createOrganizationRequest: apiToDisk.ToDiskCreateOrganizationRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization,
        traceId: reqValid.info.traceId
      },
      payload: {
        organizationId: newOrg.organization_id
      }
    };

    await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateOrganizationResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          organizationId: newOrg.organization_id,
          projectId: undefined
        }),
        message: createOrganizationRequest,
        checkIsOk: true
      }
    );

    let payload: apiToBackend.ToBackendCreateOrganizationResponsePayload = {
      organization: wrapper.wrapToApiOrg(newOrg)
    };

    return payload;
  }
}
