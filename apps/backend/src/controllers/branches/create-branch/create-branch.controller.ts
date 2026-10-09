import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateBranchRequestDto,
  ToBackendCreateBranchResponseDto
} from '#backend/controllers/branches/create-branch/create-branch.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import {
  BlockmlService,
  type RebuildStructResultValue
} from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { EMPTY_STRUCT_ID, PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import type { BackendSessionBranchCannotBeCreatedError } from '#common/types/backend/errors/backend-session-branch-cannot-be-created-error';
import type { CheckRepoIdResultError } from '#common/types/backend/function-errors/check-repo-id-result-error';
import type { GetBranchCheckExistsResultError } from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { RebuildStructResultError } from '#common/types/backend/function-errors/rebuild-struct-result-error';
import type { SendToDiskResultError } from '#common/types/backend/function-errors/send-to-disk-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateBranchOutput } from '#common/types/backend/routes/branches/create-branch/create-branch-output';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';
import type { ToDiskCreateBranchOutput } from '#common/types/disk/routes/branches/create-branch/create-branch-output';

@ApiTags('Branches')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateBranchController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private rpcService: RpcService,
    private sessionsService: SessionsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private membersService: MembersService,
    private blockmlService: BlockmlService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendCreateBranch' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateBranch',
    description: 'Create a new branch from an existing branch'
  })
  @ApiOkResponse({
    type: ToBackendCreateBranchResponseDto
  })
  async createBranch(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateBranchRequestDto
  ): Promise<BackendResultForOperation<'createBranch'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        newBranchId: body.input.newBranchId,
        fromBranchId: body.input.fromBranchId,
        repoId: body.input.repoId,
        traceId: body.traceId,
        userId: user.userId
      }),
      Result.bind(
        'repoType',
        (v): Result.ResultAsync<RepoType, CheckRepoIdResultError> =>
          this.sessionsService.checkRepoIdResult({
            repoId: v.repoId,
            userId: v.userId,
            projectId: v.projectId,
            allowProdRepo: true
          })
      ),
      Result.andThrough(v =>
        v.repoType === 'session'
          ? Result.fail({
              code: 'BACKEND_SESSION_BRANCH_CANNOT_BE_CREATED'
            } satisfies BackendSessionBranchCannotBeCreatedError)
          : Result.succeed()
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsEditorResult({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'fromBranch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsResultError> =>
          this.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.fromBranchId
          })
      ),
      Result.andThrough(v =>
        this.branchesService.checkBranchDoesNotExistResult({
          projectId: v.projectId,
          repoId: v.repoId,
          branchId: v.newBranchId
        })
      ),
      Result.bind(
        'diskCreateBranchOutput',
        (
          v
        ): Result.ResultAsync<
          ToDiskCreateBranchOutput,
          SendToDiskResultError
        > =>
          this.rpcService.sendToDiskResult({
            request: {
              operation: 'createBranch',
              traceId: v.traceId,
              input: {
                baseProject: this.tabService.projectTabToBaseProject({
                  project: v.project
                }),
                repoId: v.repoId,
                newBranch: v.newBranchId,
                fromBranch: v.fromBranchId,
                isFromRemote: false
              }
            }
          })
      ),
      Result.bind(
        'newBranch',
        (v): Result.Result<BranchTab, never> =>
          Result.succeed(
            this.branchesService.makeBranch({
              projectId: v.projectId,
              repoId: v.repoId,
              branchId: v.newBranchId
            })
          )
      ),
      Result.bind(
        'fromBranchBridgeEnts',
        (v): Result.ResultAsync<BridgeEnt[], never> =>
          this.db.drizzle.query.bridgesTable
            .findMany({
              where: and(
                eq(bridgesTable.projectId, v.fromBranch.projectId),
                eq(bridgesTable.repoId, v.fromBranch.repoId),
                eq(bridgesTable.branchId, v.fromBranch.branchId)
              )
            })
            .then(bridgeEnts => Result.succeed(bridgeEnts))
      ),
      Result.bind(
        'newBranchBridges',
        (v): Result.Result<BridgeTab[], never> =>
          Result.succeed(
            v.fromBranchBridgeEnts.map(bridgeEnt =>
              this.bridgesService.makeBridge({
                projectId: v.newBranch.projectId,
                repoId: v.newBranch.repoId,
                branchId: v.newBranch.branchId,
                envId: bridgeEnt.envId,
                structId: EMPTY_STRUCT_ID,
                needValidate: true
              })
            )
          )
      ),
      Result.andThrough(v =>
        Result.sequence(
          v.newBranchBridges,
          async (
            bridge
          ): Result.ResultAsync<void, RebuildStructResultError> => {
            if (bridge.envId === PROJECT_ENV_PROD) {
              let structId: string = makeId();

              let result: Result.Result<
                RebuildStructResultValue,
                RebuildStructResultError
              > = await this.blockmlService.rebuildStructResult({
                traceId: v.traceId,
                orgId: v.project.orgId,
                projectId: v.projectId,
                repoId: v.repoId,
                structId: structId,
                diskFiles: v.diskCreateBranchOutput.files,
                mproveDir: v.diskCreateBranchOutput.mproveDir,
                envId: bridge.envId,
                selectedGivens: [],
                overrideTimezone: undefined
              });

              if (Result.isFailure(result)) {
                return result;
              }

              bridge.structId = structId;
              bridge.needValidate = false;
            } else {
              bridge.structId = EMPTY_STRUCT_ID;
              bridge.needValidate = true;
            }

            return Result.succeed();
          }
        )
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insert: {
                        branches: [v.newBranch],
                        bridges: [...v.newBranchBridges]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.map((v): ToBackendCreateBranchOutput => ({}))
    );
  }
}
