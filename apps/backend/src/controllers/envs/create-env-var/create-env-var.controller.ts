import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendCreateEnvVarRequestDto,
  ToBackendCreateEnvVarResponseDto
} from '#backend/controllers/envs/create-env-var/create-env-var.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getMemberCheckIsEditorOrAdmin } from '#backend/functions/db/members/get-member-check-is-editor-or-admin/get-member-check-is-editor-or-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { checkProjectIsNotRestricted } from '#backend/functions/db/projects/check-project-is-not-restricted/check-project-is-not-restricted';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { Ev } from '#common/types/backend/parts/ev';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateEnvVarOutput } from '#common/types/backend/routes/envs/create-env-var/create-env-var-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateEnvVarController {
  constructor(
    private db: DbService,
    private cs: ConfigService<BackendConfig>
  ) {}

  @Post('api/ToBackendCreateEnvVar' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateEnvVar',
    description: 'Create a new environment variable'
  })
  @ApiOkResponse({
    type: ToBackendCreateEnvVarResponseDto
  })
  async createEnvVar(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateEnvVarRequestDto
  ): Promise<BackendResultForOperation<'createEnvVar'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        evId: body.input.evId,
        val: body.input.val,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        getMemberCheckIsEditorOrAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: undefined,
          cs: this.cs
        })
      ),
      Result.bind('env', v =>
        getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.andThrough(v =>
        v.env.evs.some(ev => ev.evId === v.evId)
          ? Result.fail({ code: 'BACKEND_EV_ALREADY_EXISTS' })
          : Result.succeed()
      ),
      Result.map(v => {
        let newEv: Ev = { evId: v.evId, val: v.val };

        v.env.evs.push(newEv);

        return v;
      }),
      Result.bind('branchBridges', v =>
        this.db.bridges.findMany({
          where: and(
            eq(bridgesTable.projectId, v.projectId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.map(v => {
        v.branchBridges.forEach(bridge => {
          bridge.needValidate = true;
        });
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: {
            bridges: [...v.branchBridges],
            envs: [v.env]
          }
        })
      ),
      Result.bind('apiEnvs', v =>
        getApiEnvs({ db: this.db, projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendCreateEnvVarOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
