import { AppController } from 'src/app.controller';
import { api } from '../barrels/api';

export async function createOrganization(
  request: api.CreateOrganizationRequest
): Promise<api.CreateOrganizationResponse> {
  let organizationId = request.payload.organizationId;

  return {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok
    },
    payload: {
      organizationId: organizationId
    }
  };
}
