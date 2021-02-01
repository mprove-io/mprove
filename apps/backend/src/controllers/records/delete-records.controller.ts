import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { In } from 'typeorm';
import { api } from '~backend/barrels/api';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class DeleteRecordsController {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>,
    private userRepository: repositories.UserRepository
  ) {}

  @Post(api.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords)
  async deleteRecords(@Body() body) {
    try {
      let reqValid = await api.transformValid({
        classType: api.ToBackendDeleteRecordsRequest,
        object: body,
        errorMessage: api.ErEnum.M_BACKEND_WRONG_REQUEST_PARAMS
      });

      let { organizationIds, emails } = reqValid.payload;

      // toDisk

      if (helper.isDefined(organizationIds) && organizationIds.length > 0) {
        await asyncPool(1, organizationIds, async (x: string) => {
          let deleteOrganizationRequest: api.ToDiskDeleteOrganizationRequest = {
            info: {
              name: api.ToDiskRequestInfoNameEnum.ToDiskDeleteOrganization,
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

          let deleteOrganizationResp = await this.rabbitService.sendToDisk<api.ToDiskDeleteOrganizationResponse>(
            {
              routingKey: routingKey,
              message: deleteOrganizationRequest
            }
          );

          if (
            deleteOrganizationResp.info.status !== api.ResponseInfoStatusEnum.Ok
          ) {
            throw new api.ServerError({
              message: api.ErEnum.M_BACKEND_ERROR_RESPONSE_FROM_DISK,
              originalError: deleteOrganizationResp.info.error
            });
          }
        });
      }

      // db

      if (helper.isDefined(emails) && emails.length > 0) {
        await this.userRepository.delete({ email: In(emails) });
      }

      let payload: api.ToBackendDeleteRecordsResponse['payload'] = {};

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
