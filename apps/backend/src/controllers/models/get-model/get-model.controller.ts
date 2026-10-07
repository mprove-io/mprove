import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ToBackendGetModelRequestDto,
  ToBackendGetModelResponseDto
} from '#backend/controllers/models/get-model/get-model.dto';
import { GetModelService } from '#backend/controllers/models/get-model/get-model.service';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetModelOutput } from '#common/types/backend/routes/models/get-model/get-model-output';

@ApiTags('Models')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetModelController {
  constructor(private getModelService: GetModelService) {}

  @Post('api/ToBackendGetModel' satisfies ToBackendRoute)
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
    let { projectId, repoId, branchId, modelId, envId, getMalloy } = body.input;

    let payload: ToBackendGetModelOutput = await this.getModelService.getModel({
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
