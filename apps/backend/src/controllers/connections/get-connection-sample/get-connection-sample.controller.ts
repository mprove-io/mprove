import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GetConnectionSampleService } from '#backend/controllers/connections/get-connection-sample/get-connection-sample.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetConnectionSampleRequest,
  ToBackendGetConnectionSampleResponsePayload
} from '#common/interfaces/to-backend/connections/to-backend-get-connection-sample';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionSampleController {
  constructor(private connectionSampleService: GetConnectionSampleService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetConnectionSample)
  async getConnectionSample(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetConnectionSampleRequest = request.body;

    let {
      projectId,
      envId,
      connectionId,
      schemaName,
      tableName,
      columnName,
      offset
    } = reqValid.payload;

    let result = await this.connectionSampleService.getConnectionSample({
      userId: user.userId,
      projectId: projectId,
      envId: envId,
      connectionId: connectionId,
      schemaName: schemaName,
      tableName: tableName,
      columnName: columnName,
      offset: offset
    });

    let payload: ToBackendGetConnectionSampleResponsePayload = {
      columnNames: result.columnNames,
      rows: result.rows,
      errorMessage: result.errorMessage
    };

    return payload;
  }
}
