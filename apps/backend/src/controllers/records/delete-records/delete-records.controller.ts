import { Controller, Post, UseGuards } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { RabbitService } from '~backend/services/rabbit.service';

@UseGuards(TestRoutesGuard)
@SkipJwtCheck()
@Controller()
export class DeleteRecordsController {
  constructor(
    private rabbitService: RabbitService,
    private orgsRepository: repositories.OrgsRepository,
    private userRepository: repositories.UsersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords)
  async deleteRecords(
    @ValidateRequest(apiToBackend.ToBackendDeleteRecordsRequest)
    reqValid: apiToBackend.ToBackendDeleteRecordsRequest
  ) {
    let { orgNames, emails } = reqValid.payload;

    if (common.isDefined(orgNames) && orgNames.length > 0) {
      await asyncPool(1, orgNames, async (x: string) => {
        let org = await this.orgsRepository.findOne({ name: x });

        if (common.isDefined(org)) {
          let deleteOrganizationRequest: apiToDisk.ToDiskDeleteOrganizationRequest = {
            info: {
              name:
                apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrganization,
              traceId: reqValid.info.traceId
            },
            payload: {
              organizationId: org.organization_id
            }
          };

          await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteOrganizationResponse>(
            {
              routingKey: helper.makeRoutingKeyToDisk({
                organizationId: org.organization_id,
                projectId: null
              }),
              message: deleteOrganizationRequest,
              checkIsOk: true
            }
          );

          await this.orgsRepository.delete({ name: In(orgNames) });
        }
      });
    }

    if (common.isDefined(emails) && emails.length > 0) {
      await this.userRepository.delete({ email: In(emails) });
    }

    let payload: apiToBackend.ToBackendDeleteRecordsResponse['payload'] = {};

    return payload;
  }
}
