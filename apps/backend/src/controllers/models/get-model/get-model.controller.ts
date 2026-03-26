import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { GetModelService } from '#backend/controllers/models/get-model/get-model.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetModelRequest,
  ToBackendGetModelResponsePayload
} from '#common/interfaces/to-backend/models/to-backend-get-model';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetModelController {
  constructor(private getModelService: GetModelService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetModel)
  async getModel(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetModelRequest = request.body;

    let { projectId, repoId, branchId, modelId, envId } = reqValid.payload;

    let payload: ToBackendGetModelResponsePayload =
      await this.getModelService.getModel({
        userId: user.userId,
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId,
        modelId: modelId
      });

    return payload;
  }
}
