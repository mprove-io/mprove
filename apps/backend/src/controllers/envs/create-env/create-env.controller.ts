import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  type ToBackendCreateEnvRequestDto,
  ToBackendCreateEnvResponseDto
} from '#backend/controllers/envs/create-env/create-env.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import type { BridgeTab } from '#backend/drizzle/postgres/tables/bridges';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { makeBridge } from '#backend/functions/db/bridges/make-bridge/make-bridge';
import { checkEnvDoesNotExist } from '#backend/functions/db/envs/check-env-does-not-exist/check-env-does-not-exist';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { makeEnv } from '#backend/functions/db/envs/make-env/make-env';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
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
  constructor(private db: DbService) {}

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
        getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        checkEnvDoesNotExist({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId
        })
      ),
      Result.bind('newEnv', v =>
        Result.succeed(
          makeEnv({
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
          makeBridge({
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
        getApiEnvs({ db: this.db, projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendCreateEnvOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
