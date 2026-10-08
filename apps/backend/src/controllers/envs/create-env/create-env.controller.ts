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
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateEnvRequestDto,
  ToBackendCreateEnvResponseDto
} from '#backend/controllers/envs/create-env/create-env.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BridgeTab,
  EnvTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BranchEnt,
  branchesTable
} from '#backend/drizzle/postgres/schema/branches';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetApiEnvsResultError } from '#common/types/backend/function-errors/get-api-envs-result-error';
import type { GetMemberCheckIsAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-admin-result-error';
import type { Env } from '#common/types/backend/parts/env';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateEnvOutput } from '#common/types/backend/routes/envs/create-env/create-env-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateEnvController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendCreateEnv' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateEnv',
    description: 'Create a new environment for a project'
  })
  @ApiOkResponse({
    type: ToBackendCreateEnvResponseDto
  })
  async createEnv(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateEnvRequestDto
  ): Promise<BackendResultForOperation<'createEnv'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        userId: user.userId,
        projectsService: this.projectsService,
        membersService: this.membersService,
        envsService: this.envsService,
        bridgesService: this.bridgesService,
        db: this.db,
        cs: this.cs,
        logger: this.logger
      }),
      Result.andThrough(v =>
        v.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminResultError> =>
          v.membersService.getMemberCheckIsAdminResult({
            memberId: v.userId,
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        v.envsService.checkEnvDoesNotExistResult({
          projectId: v.projectId,
          envId: v.envId
        })
      ),
      Result.bind(
        'newEnv',
        (v): Result.Result<EnvTab, never> =>
          Result.succeed(
            v.envsService.makeEnv({
              projectId: v.projectId,
              envId: v.envId,
              evs: []
            })
          )
      ),
      Result.bind(
        'branchEnts',
        async (v): Result.ResultAsync<BranchEnt[], never> => {
          let branchEnts: BranchEnt[] =
            await v.db.drizzle.query.branchesTable.findMany({
              where: eq(branchesTable.projectId, v.projectId)
            });

          return Result.succeed(branchEnts);
        }
      ),
      Result.bind('newBridges', (v): Result.Result<BridgeTab[], never> => {
        let newBridges: BridgeTab[] = v.branchEnts.map(branchEnt =>
          v.bridgesService.makeBridge({
            projectId: v.projectId,
            repoId: branchEnt.repoId,
            branchId: branchEnt.branchId,
            envId: v.envId,
            structId: EMPTY_STRUCT_ID,
            needValidate: true
          })
        );

        return Result.succeed(newBridges);
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await v.db.drizzle.transaction(
                  async tx =>
                    await v.db.packer.write({
                      tx: tx,
                      insert: { envs: [v.newEnv], bridges: v.newBridges }
                    })
                ),
              getRetryOption(v.cs, v.logger)
            );
          }
        })
      ),
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsResultError> =>
          v.envsService.getApiEnvsResult({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendCreateEnvOutput => ({
          userMember: v.membersService.tabToApi({ member: v.userMember }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
