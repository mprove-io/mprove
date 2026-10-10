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
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

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
  ): Promise<BackendResultForOperation<'getModel'>> {
    return this.getModelService.getModelResult({
      ...body.input,
      userId: user.userId
    });
  }
}
