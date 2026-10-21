import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendCreateEnvRequestDto,
  ToBackendCreateEnvResponseDto
} from '#backend/controllers/envs/create-env/create-env.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BridgeTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateEnvOutput } from '#common/types/backend/routes/envs/create-env/create-env-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateEnvController {
  constructor(
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private db: DbService
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
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.membersService.getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        this.envsService.checkEnvDoesNotExist({
          projectId: v.projectId,
          envId: v.envId
        })
      ),
      Result.bind('newEnv', v =>
        Result.succeed(
          this.envsService.makeEnv({
            projectId: v.projectId,
            envId: v.envId,
            evs: []
          })
        )
      ),
      Result.bind('branches', v =>
        this.db.branches.findMany({
          where: eq(branchesTable.projectId, v.projectId)
        })
      ),
      Result.bind('newBridges', v => {
        let newBridges: BridgeTab[] = v.branches.map(branch =>
          this.bridgesService.makeBridge({
            projectId: v.projectId,
            repoId: branch.repoId,
            branchId: branch.branchId,
            envId: v.envId,
            structId: EMPTY_STRUCT_ID,
            needValidate: true
          })
        );

        return Result.succeed(newBridges);
      }),
      Result.andThrough(v =>
        this.db.write({
          insert: { envs: [v.newEnv], bridges: v.newBridges }
        })
      ),
      Result.bind('apiEnvs', v =>
        this.envsService.getApiEnvs({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendCreateEnvOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
