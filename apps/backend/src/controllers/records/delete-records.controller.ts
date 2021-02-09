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
    private userRepository: repositories.UsersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords)
  async deleteRecords(
    @ValidateRequest(apiToBackend.ToBackendDeleteRecordsRequest)
    reqValid: apiToBackend.ToBackendDeleteRecordsRequest
  ) {
    let { organizationIds, emails } = reqValid.payload;

    // toDisk

    if (common.isDefined(organizationIds) && organizationIds.length > 0) {
      await asyncPool(1, organizationIds, async (x: string) => {
        let deleteOrganizationRequest: apiToDisk.ToDiskDeleteOrganizationRequest = {
          info: {
            name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrganization,
            traceId: reqValid.info.traceId
          },
          payload: {
            organizationId: x
          }
        };

        let routingKey = helper.makeRoutingKeyToDisk({
          organizationId: x,
          projectId: null
        });

        let deleteOrganizationResp = await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteOrganizationResponse>(
          {
            routingKey: routingKey,
            message: deleteOrganizationRequest
          }
        );

        if (
          deleteOrganizationResp.info.status !==
          common.ResponseInfoStatusEnum.Ok
        ) {
          throw new common.ServerError({
            message: apiToBackend.ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK,
            originalError: deleteOrganizationResp.info.error
          });
        }
      });
    }

    // db

    if (common.isDefined(emails) && emails.length > 0) {
      await this.userRepository.delete({ email: In(emails) });
    }

    let payload: apiToBackend.ToBackendDeleteRecordsResponse['payload'] = {};

    return payload;
  }
}