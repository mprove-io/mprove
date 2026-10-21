import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendEditEnvFallbacksRequestDto,
  ToBackendEditEnvFallbacksResponseDto
} from '#backend/controllers/envs/edit-env-fallbacks/edit-env-fallbacks.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
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
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private db: DbService
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
        this.membersService.getMemberCheckIsEditorOrAdmin({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        this.projectsService.checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: undefined
        })
      ),
      Result.bind('env', v =>
        this.envsService.getEnvCheckExistsAndAccess({
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
        this.envsService.getApiEnvs({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendEditEnvFallbacksOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
