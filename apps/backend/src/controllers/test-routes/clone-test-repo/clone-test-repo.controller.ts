import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ToBackendCloneTestRepoRequestDto,
  ToBackendCloneTestRepoResponseDto
} from '#backend/controllers/test-routes/clone-test-repo/clone-test-repo.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { TestRoutesGuard } from '#backend/guards/test-routes/test-routes.guard';
import { RpcService } from '#backend/services/rpc/rpc.service';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCloneTestRepoOutput } from '#common/types/backend/routes/test-routes/clone-test-repo/clone-test-repo-output';

@ApiTags('TestRoutes')
@SkipJwtCheck()
@SkipThrottle()
@UseGuards(TestRoutesGuard)
@Controller()
export class CloneTestRepoController {
  constructor(
    private rpcService: RpcService,
    private logger: Logger
  ) {}

  @Post('api/ToBackendCloneTestRepo' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CloneTestRepo',
    description: 'Clone a test fixture repo on disk for end-to-end tests'
  })
  @ApiOkResponse({
    type: ToBackendCloneTestRepoResponseDto
  })
  async cloneTestRepo(@Body() body: ToBackendCloneTestRepoRequestDto) {
    let { testId } = body.input;

    await this.rpcService.sendToDiskUnwrapOutput({
      request: {
        operation: 'cloneTestRepo',
        traceId: body.traceId,
        input: {
          testId: testId
        }
      }
    });

    let payload: ToBackendCloneTestRepoOutput = {};

    return payload;
  }
}
