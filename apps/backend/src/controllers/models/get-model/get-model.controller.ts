import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ToBackendGetModelRequestDto,
  ToBackendGetModelResponseDto
} from '#backend/controllers/models/get-model/get-model.dto';
import { GetModelService } from '#backend/controllers/models/get-model/get-model.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetModelResponsePayload } from '#common/zod/to-backend/models/to-backend-get-model';

@ApiTags('Models')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetModelController {
  constructor(private getModelService: GetModelService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetModel)
  @ApiOperation({
    summary: 'GetModel',
    description: 'Get a model'
  })
  @ApiOkResponse({
    type: ToBackendGetModelResponseDto
  })
  async getModel(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetModelRequestDto
  ) {
    let { projectId, repoId, branchId, modelId, envId, getMalloy } =
      body.payload;

    let payload: ToBackendGetModelResponsePayload =
      await this.getModelService.getModel({
        userId: user.userId,
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId,
        modelId: modelId,
        getMalloy: getMalloy
      });

    return payload;
  }
}
