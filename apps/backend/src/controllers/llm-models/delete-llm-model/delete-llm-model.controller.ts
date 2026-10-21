import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendDeleteLlmModelRequestDto,
  ToBackendDeleteLlmModelResponseDto
} from '#backend/controllers/llm-models/delete-llm-model/delete-llm-model.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteLlmModelOutput } from '#common/types/backend/routes/llm-models/delete-llm-model/delete-llm-model-output';

@ApiTags('LlmModels')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteLlmModelController {
  constructor(
    private providersService: ProvidersService,
    private membersService: MembersService,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteLlmModel' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteLlmModel',
    description: 'Delete a model from an existing provider'
  })
  @ApiOkResponse({ type: ToBackendDeleteLlmModelResponseDto })
  async deleteLlmModel(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteLlmModelRequestDto
  ): Promise<BackendResultForOperation<'deleteLlmModel'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        providerId: body.input.providerId,
        modelId: body.input.modelId,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind('provider', v =>
        this.db.providers.findFirstCheckExists({
          where: and(
            eq(providersTable.projectId, v.projectId),
            eq(providersTable.providerId, v.providerId)
          )
        })
      ),
      Result.andThrough(v =>
        this.providersService.getLlmModelCheckExists({
          provider: v.provider,
          modelId: v.modelId
        })
      ),
      Result.map(v => {
        v.provider.models = v.provider.models.filter(
          model => model.modelId !== v.modelId
        );
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({ update: { providers: [v.provider] } })
      ),
      Result.map(
        (v): ToBackendDeleteLlmModelOutput => ({
          provider: this.providersService.tabToApiProvider({
            provider: v.provider,
            isIncludePasswords: false
          })
        })
      )
    );
  }
}
