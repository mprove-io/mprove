import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GetConnectionSchemasService } from '#backend/controllers/connections/get-connection-schemas/get-connection-schemas.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetConnectionSchemasRequest,
  ToBackendGetConnectionSchemasResponsePayload
} from '#common/interfaces/to-backend/connections/to-backend-get-connection-schemas';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionSchemasController {
  constructor(
    private getConnectionSchemasService: GetConnectionSchemasService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetConnectionSchemas)
  async getConnectionSchemas(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetConnectionSchemasRequest = request.body;

    let { projectId, envId, repoId, branchId, isRefresh } = reqValid.payload;

    let result = await this.getConnectionSchemasService.getConnectionSchemas({
      userId: user.userId,
      projectId: projectId,
      envId: envId,
      repoId: repoId,
      branchId: branchId,
      isRefresh: isRefresh
    });

    let payload: ToBackendGetConnectionSchemasResponsePayload = {
      userMember: result.userMember,
      combinedSchemaItems: result.combinedSchemaItems
    };

    return payload;
  }
}
