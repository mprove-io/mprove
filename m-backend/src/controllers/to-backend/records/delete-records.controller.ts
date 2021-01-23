import { api } from '../../../barrels/api';
import { UsersService } from '../../../services/users.service';

import { Body, Controller, Post } from '@nestjs/common';
import { helper } from '../../../barrels/helper';
import asyncPool from 'tiny-async-pool';
import { RabbitService } from '../../../services/rabbit.service';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../../../barrels/interfaces';

@Controller()
export class ToBackendDeleteRecordsController {
  constructor(
    private rabbitService: RabbitService,
    private usersService: UsersService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(api.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords)
  async toBackendDeleteRecords(@Body() body) {
    try {
      let reqValid = await api.transformValid({
        classType: api.ToBackendDeleteRecordsRequest,
        object: body,
        errorMessage: api.ErEnum.M_BACKEND_WRONG_REQUEST_PARAMS
      });

      let { organizationIds, userIds } = reqValid.payload;

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

          let deleteOrganizationResp = await this.rabbitService.sendToDisk<
            api.ToDiskDeleteOrganizationResponse
          >({
            routingKey: routingKey,
            message: deleteOrganizationRequest
          });

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

      if (helper.isDefined(userIds) && userIds.length > 0) {
        await this.usersService.deleteUsers(userIds);
      }

      let payload: api.ToBackendDeleteRecordsResponse['payload'] = {};

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
