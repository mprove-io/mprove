import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendEditEnvVarRequestDto,
  ToBackendEditEnvVarResponseDto
} from '#backend/controllers/envs/edit-env-var/edit-env-var.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BridgeTab,
  EnvTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendEvDoesNotExistError } from '#common/types/backend/errors/backend-ev-does-not-exist-error';
import type { DbBridgesFindManyError } from '#common/types/backend/function-errors/db/bridges/db-bridges-find-many-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { GetEnvCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import type { GetMemberCheckIsEditorOrAdminError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-error';
import type { Env } from '#common/types/backend/parts/env';
import type { Ev } from '#common/types/backend/parts/ev';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditEnvVarOutput } from '#common/types/backend/routes/envs/edit-env-var/edit-env-var-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditEnvVarController {
  constructor(
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private db: DbService
  ) {}

  @Post('api/ToBackendEditEnvVar' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditEnvVar',
    description: 'Update the value of an environment variable'
  })
  @ApiOkResponse({
    type: ToBackendEditEnvVarResponseDto
  })
  async editEnvVar(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditEnvVarRequestDto
  ): Promise<BackendResultForOperation<'editEnvVar'>> {
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
      Result.bind(
        'userMember',
        (
          v
        ): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorOrAdminError> =>
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
      Result.bind(
        'env',
        (v): Result.ResultAsync<EnvTab, GetEnvCheckExistsAndAccessError> =>
          this.envsService.getEnvCheckExistsAndAccess({
            projectId: v.projectId,
            envId: v.envId,
            member: v.userMember
          })
      ),
      Result.bind('ev', (v): Result.Result<Ev, BackendEvDoesNotExistError> => {
        let ev: Ev = v.env.evs.find(ev => ev.evId === v.evId);

        return isUndefined(ev)
          ? Result.fail({ code: 'BACKEND_EV_DOES_NOT_EXIST' })
          : Result.succeed(ev);
      }),
      Result.map(v => {
        v.ev.val = v.val;
        return v;
      }),
      Result.bind(
        'branchBridges',
        (v): Result.ResultAsync<BridgeTab[], DbBridgesFindManyError> =>
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
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsError> =>
          this.envsService.getApiEnvs({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendEditEnvVarOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
