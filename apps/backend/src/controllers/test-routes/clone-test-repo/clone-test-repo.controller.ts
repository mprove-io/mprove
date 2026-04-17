import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ToBackendCloneTestRepoRequestDto,
  ToBackendCloneTestRepoResponseDto
} from '#backend/controllers/test-routes/clone-test-repo/clone-test-repo.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import { TestRoutesGuard } from '#backend/guards/test-routes.guard';
import { RpcService } from '#backend/services/rpc.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToBackendCloneTestRepoResponse } from '#common/zod/to-backend/test-routes/to-backend-clone-test-repo';
import type {
  ToDiskCloneTestRepoRequest,
  ToDiskCloneTestRepoResponse
} from '#common/zod/to-disk/10-test/to-disk-clone-test-repo';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendCloneTestRepo)
  @ApiOperation({
    summary: 'CloneTestRepo',
    description: 'Clone a test fixture repo on disk for end-to-end tests'
  })
  @ApiOkResponse({
    type: ToBackendCloneTestRepoResponseDto
  })
  async cloneTestRepo(@Body() body: ToBackendCloneTestRepoRequestDto) {
    let { orgId, testId } = body.payload;

    let cloneTestRepoRequest: ToDiskCloneTestRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCloneTestRepo,
        traceId: body.info.traceId
      },
      payload: {
        testId: testId
      }
    };

    await this.rpcService.sendToDisk<ToDiskCloneTestRepoResponse>({
      orgId: orgId,
      projectId: null,
      repoId: null,
      message: cloneTestRepoRequest,
      checkIsOk: true
    });

    let payload: ToBackendCloneTestRepoResponse['payload'] = {};

    return payload;
  }
}
