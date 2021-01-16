import { api } from '../../barrels/api';
import { UsersService } from '../../services/users.service';

import { Body, Controller, Post } from '@nestjs/common';

@Controller()
export class ToBackendDeleteRecordsController {
  constructor(private usersService: UsersService) {}

  @Post(api.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords)
  async toBackendDeleteRecords(
    @Body() body: api.ToBackendDeleteRecordsRequest
  ): Promise<api.ToBackendDeleteRecordsResponse | api.ErrorResponse> {
    try {
      let requestValid = await api.transformValid({
        classType: api.ToBackendDeleteRecordsRequest,
        object: body,
        errorMessage: api.ErEnum.M_BACKEND_WRONG_REQUEST_PARAMS
      });

      let { traceId } = requestValid.info;
      let { userIds } = requestValid.payload;

      if (userIds.length > 0) {
        await this.usersService.deleteUsers(userIds);
      }

      let response: api.ToBackendDeleteRecordsResponse = {
        info: {
          status: api.ResponseInfoStatusEnum.Ok,
          traceId: traceId
        },
        payload: {}
      };

      return response;
    } catch (e) {
      api.handleError(e);
      return api.makeErrorResponse({ request: body, e: e });
    }
  }
}
