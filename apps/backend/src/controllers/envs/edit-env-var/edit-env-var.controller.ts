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
  ToBackendEditEnvVarRequestDto,
  ToBackendEditEnvVarResponseDto
} from '#backend/controllers/envs/edit-env-var/edit-env-var.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  EnvTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendEvDoesNotExistError } from '#common/types/backend/errors/backend-ev-does-not-exist-error';
import type { GetApiEnvsResultError } from '#common/types/backend/function-errors/get-api-envs-result-error';
import type { GetEnvCheckExistsAndAccessResultError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-result-error';
import type { GetMemberCheckIsEditorOrAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-result-error';
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
    private tabService: TabService,
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        ...body.input,
        userId: user.userId,
        projectsService: this.projectsService,
        membersService: this.membersService,
        envsService: this.envsService,
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
        (
          v
        ): Result.ResultAsync<
          MemberTab,
          GetMemberCheckIsEditorOrAdminResultError
        > =>
          v.membersService.getMemberCheckIsEditorOrAdminResult({
            memberId: v.userId,
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        v.projectsService.checkProjectIsNotRestrictedResult({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: undefined
        })
      ),
      Result.bind(
        'env',
        (
          v
        ): Result.ResultAsync<EnvTab, GetEnvCheckExistsAndAccessResultError> =>
          v.envsService.getEnvCheckExistsAndAccessResult({
            projectId: v.projectId,
            envId: v.envId,
            member: v.userMember
          })
      ),
      Result.bind('ev', (v): Result.Result<Ev, BackendEvDoesNotExistError> => {
        let ev: Ev = v.env.evs.find(ev => ev.evId === v.evId);

        if (isUndefined(ev)) {
          return Result.fail({ code: 'BACKEND_EV_DOES_NOT_EXIST' });
        }

        return Result.succeed(ev);
      }),
      Result.inspect(v => {
        v.ev.val = v.val;
      }),
      Result.bind(
        'branchBridgeEnts',
        async (v): Result.ResultAsync<BridgeEnt[], never> => {
          let branchBridgeEnts: BridgeEnt[] =
            await v.db.drizzle.query.bridgesTable.findMany({
              where: and(
                eq(bridgesTable.projectId, v.projectId),
                eq(bridgesTable.envId, v.envId)
              )
            });

          return Result.succeed(branchBridgeEnts);
        }
      ),
      Result.inspect(v => {
        v.branchBridgeEnts.forEach(bridgeEnt => {
          bridgeEnt.needValidate = true;
        });
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await v.db.drizzle.transaction(async tx => {
                  await v.db.packer.write({
                    tx: tx,
                    insertOrUpdate: {
                      bridges: [...v.branchBridgeEnts],
                      envs: [v.env]
                    }
                  });
                }),
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
        (v): ToBackendEditEnvVarOutput => ({
          userMember: v.membersService.tabToApi({ member: v.userMember }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
