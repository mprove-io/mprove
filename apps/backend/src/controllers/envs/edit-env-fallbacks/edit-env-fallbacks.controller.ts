import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendEditEnvFallbacksRequestDto,
  ToBackendEditEnvFallbacksResponseDto
} from '#backend/controllers/envs/edit-env-fallbacks/edit-env-fallbacks.dto';
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
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditEnvFallbacksOutput } from '#common/types/backend/routes/envs/edit-env-fallbacks/edit-env-fallbacks-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditEnvFallbacksController {
  constructor(
    private db: DbService,
    private cs: ConfigService<BackendConfig>
  ) {}

  @Post('api/ToBackendEditEnvFallbacks' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditEnvFallbacks',
    description: 'Update production fallback for an environment'
  })
  @ApiOkResponse({
    type: ToBackendEditEnvFallbacksResponseDto
  })
  async editEnvFallbacks(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditEnvFallbacksRequestDto
  ): Promise<BackendResultForOperation<'editEnvFallbacks'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        isFallbackToProdConnections: body.input.isFallbackToProdConnections,
        isFallbackToProdVariables: body.input.isFallbackToProdVariables,
        useProdCache: body.input.useProdCache,
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
      Result.map(v => {
        v.env.isFallbackToProdConnections = v.isFallbackToProdConnections;

        v.env.isFallbackToProdVariables = v.isFallbackToProdVariables;

        v.env.useProdCache = v.useProdCache;

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
        (v): ToBackendEditEnvFallbacksOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
