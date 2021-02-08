import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { Public, ValidateRequest } from '~backend/decorators/_index';
import { RabbitService } from '~backend/services/rabbit.service';

@Public()
@Controller()
export class DeleteRecordsController {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>,
    private userRepository: repositories.UsersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords)
  async deleteRecords(
    @Body() body,
    @ValidateRequest(apiToBackend.ToBackendDeleteRecordsRequest)
    reqValid: apiToBackend.ToBackendDeleteRecordsRequest
  ) {
    try {
      let { organizationIds, emails } = reqValid.payload;

      // toDisk

      if (helper.isDefined(organizationIds) && organizationIds.length > 0) {
        await asyncPool(1, organizationIds, async (x: string) => {
          let deleteOrganizationRequest: apiToDisk.ToDiskDeleteOrganizationRequest = {
            info: {
              name:
                apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrganization,
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

      if (helper.isDefined(emails) && emails.length > 0) {
        await this.userRepository.delete({ email: In(emails) });
      }

      let payload: apiToBackend.ToBackendDeleteRecordsResponse['payload'] = {};

      return common.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
