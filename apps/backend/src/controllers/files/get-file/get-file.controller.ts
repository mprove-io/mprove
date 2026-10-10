import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  ToBackendGetFileRequestDto,
  ToBackendGetFileResponseDto
} from '#backend/controllers/files/get-file/get-file.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ProjectTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetBranchCheckExistsResultError } from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import type { GetBridgeCheckExistsResultError } from '#common/types/backend/function-errors/get-bridge-check-exists-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { GetModelPartXsResultError } from '#common/types/backend/function-errors/get-model-part-xs-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { GetStructCheckExistsResultError } from '#common/types/backend/function-errors/get-struct-check-exists-result-error';
import type { SendToDiskResultError } from '#common/types/backend/function-errors/send-to-disk-result-error';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetFileOutput } from '#common/types/backend/routes/files/get-file/get-file-output';
import type { ToDiskGetFileOutput } from '#common/types/disk/routes/files/get-file/get-file-output';

@ApiTags('Files')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetFileController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private rpcService: RpcService,
    private sessionsService: SessionsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post('api/ToBackendGetFile' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetFile',
    description: 'Get file'
  })
  @ApiOkResponse({
    type: ToBackendGetFileResponseDto
  })
  async getFile(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetFileRequestDto
  ): Promise<BackendResultForOperation<'getFile'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        fileNodeId: body.input.fileNodeId,
        builderLeft: body.input.builderLeft,
        traceId: body.traceId,
        user: user
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          this.membersService.getMemberCheckExistsResult({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'diskGetFileOutput',
        (v): Result.ResultAsync<ToDiskGetFileOutput, SendToDiskResultError> =>
          this.rpcService.sendToDiskResult({
            request: {
              operation: 'getFile',
              traceId: v.traceId,
              input: {
                baseProject: this.tabService.projectTabToBaseProject({
                  project: v.project
                }),
                repoId: v.repoId,
                branch: v.branchId,
                fileNodeId: v.fileNodeId,
                builderLeft: v.builderLeft
              }
            }
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsResultError> =>
          this.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsResultError> =>
          this.bridgesService.getBridgeCheckExistsResult({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsResultError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.bridge.structId,
            projectId: v.projectId,
            isGetEmptyStructOnError: true
          })
      ),
      Result.bind(
        'modelPartXs',
        (v): Result.ResultAsync<ModelPartX[], GetModelPartXsResultError> =>
          this.modelsService.getModelPartXsResult({
            structId: v.struct.structId,
            apiUserMember: this.membersService.tabToApi({
              member: v.userMember
            })
          })
      ),
      Result.map(
        (v): ToBackendGetFileOutput => ({
          repo: v.diskGetFileOutput.repo,
          originalContent: v.diskGetFileOutput.originalContent,
          content: v.diskGetFileOutput.content,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          needValidate: v.bridge.needValidate,
          isExist: v.diskGetFileOutput.isExist
        })
      )
    );
  }
}
