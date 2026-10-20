import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendMergeRepoRequestDto,
  ToBackendMergeRepoResponseDto
} from '#backend/controllers/repos/merge-repo/merge-repo.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ProjectTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROD_REPO_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { CheckRepoIdError } from '#common/types/backend/function-errors/check-repo-id-error';
import type { DbBranchesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/branches/db-branches-find-first-check-exists-error';
import type { DbBridgesFindManyError } from '#common/types/backend/function-errors/db/bridges/db-bridges-find-many-error';
import type { DbProjectsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
import type { GetMemberCheckIsEditorError } from '#common/types/backend/function-errors/get-member-check-is-editor-error';
import type { GetModelPartXsError } from '#common/types/backend/function-errors/get-model-part-xs-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendMergeRepoOutput } from '#common/types/backend/routes/repos/merge-repo/merge-repo-output';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';
import type { ToDiskMergeRepoOutput } from '#common/types/disk/routes/repos/merge-repo/merge-repo-output';

@ApiTags('Repos')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class MergeRepoController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private rpcService: RpcService,
    private sessionsService: SessionsService,
    private structsService: StructsService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendMergeRepo' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'MergeRepo',
    description: 'Merge another branch into the current branch'
  })
  @ApiOkResponse({
    type: ToBackendMergeRepoResponseDto
  })
  async mergeRepo(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendMergeRepoRequestDto
  ): Promise<BackendResultForOperation<'mergeRepo'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        theirBranchId: body.input.theirBranchId,
        isTheirBranchRemote: body.input.isTheirBranchRemote,
        traceId: body.traceId,
        user: user
      }),
      Result.bind(
        'repoType',
        (v): Result.ResultAsync<RepoType, CheckRepoIdError> =>
          this.sessionsService.checkRepoId({
            repoId: v.repoId,
            userId: v.user.userId,
            projectId: v.projectId,
            allowProdRepo: false
          })
      ),
      Result.andThrough(v =>
        v.repoType === 'session'
          ? Result.fail({ code: 'BACKEND_SESSION_BRANCH_CANNOT_BE_MERGED' })
          : Result.succeed()
      ),
      Result.bind(
        'project',
        (
          v
        ): Result.ResultAsync<
          ProjectTab,
          DbProjectsFindFirstCheckExistsError
        > =>
          this.db.projects.findFirstCheckExists({
            where: eq(projectsTable.projectId, v.projectId)
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorError> =>
          this.membersService.getMemberCheckIsEditor({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'branch',
        (
          v
        ): Result.ResultAsync<BranchTab, DbBranchesFindFirstCheckExistsError> =>
          this.db.branches.findFirstCheckExists({
            where: and(
              eq(branchesTable.projectId, v.projectId),
              eq(branchesTable.repoId, v.repoId),
              eq(branchesTable.branchId, v.branchId)
            )
          })
      ),
      Result.bind(
        'theirBranchRepoId',
        (v): Result.Result<string, never> =>
          Result.succeed(
            v.isTheirBranchRemote === true ? PROD_REPO_ID : v.repoId
          )
      ),
      Result.andThrough(v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.theirBranchRepoId),
            eq(branchesTable.branchId, v.theirBranchId)
          )
        })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccess({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'diskMergeRepoOutput',
        (v): Result.ResultAsync<ToDiskMergeRepoOutput, SendToDiskError> =>
          this.rpcService.sendToDisk({
            request: {
              operation: 'mergeRepo',
              traceId: v.traceId,
              input: {
                baseProject: this.tabService.projectTabToBaseProject({
                  project: v.project
                }),
                repoId: v.repoId,
                branch: v.branchId,
                theirBranch: v.theirBranchId,
                isTheirBranchRemote: v.isTheirBranchRemote,
                userAlias: v.user.alias
              }
            }
          })
      ),
      Result.bind(
        'branchBridges',
        (v): Result.ResultAsync<BridgeTab[], DbBridgesFindManyError> =>
          this.db.bridges.findMany({
            where: and(
              eq(bridgesTable.projectId, v.branch.projectId),
              eq(bridgesTable.repoId, v.branch.repoId),
              eq(bridgesTable.branchId, v.branch.branchId)
            )
          })
      ),
      Result.andThrough(v =>
        this.blockmlService.rebuildBranchBridges({
          branchBridges: v.branchBridges,
          envId: v.envId,
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          diskFiles: v.diskMergeRepoOutput.files,
          mproveDir: v.diskMergeRepoOutput.mproveDir
        })
      ),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: {
            bridges: [...v.branchBridges]
          }
        })
      ),
      Result.bind(
        'currentBridge',
        (v): Result.Result<BridgeTab, never> =>
          Result.succeed(
            v.branchBridges.find(bridge => bridge.envId === v.envId)
          )
      ),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExists({
            structId: v.currentBridge.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'modelPartXs',
        (v): Result.ResultAsync<ModelPartX[], GetModelPartXsError> =>
          this.modelsService.getModelPartXs({
            structId: v.struct.structId,
            apiUserMember: this.membersService.tabToApi({
              member: v.userMember
            })
          })
      ),
      Result.map(
        (v): ToBackendMergeRepoOutput => ({
          repo: v.diskMergeRepoOutput.repo,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          needValidate: v.currentBridge.needValidate
        })
      )
    );
  }
}
