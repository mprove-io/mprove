import { Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import { TestRoutesGuard } from '#backend/guards/test-routes.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { RpcService } from '#backend/services/rpc.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import {
  ToBackendCloneTestRepoRequest,
  ToBackendCloneTestRepoResponse
} from '#common/interfaces/to-backend/test-routes/to-backend-clone-test-repo';
import {
  ToDiskCloneTestRepoRequest,
  ToDiskCloneTestRepoResponse
} from '#common/interfaces/to-disk/10-test/to-disk-clone-test-repo';

@SkipJwtCheck()
@SkipThrottle()
@UseGuards(TestRoutesGuard, ValidateRequestGuard)
@Controller()
export class CloneTestRepoController {
  constructor(
    private rpcService: RpcService,
    private logger: Logger
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCloneTestRepo)
  async cloneTestRepo(@Req() request: any) {
    let reqValid: ToBackendCloneTestRepoRequest = request.body;

    let { orgId, testId } = reqValid.payload;

    let cloneTestRepoRequest: ToDiskCloneTestRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCloneTestRepo,
        traceId: reqValid.info.traceId
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
