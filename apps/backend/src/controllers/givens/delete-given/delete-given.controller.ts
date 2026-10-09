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
  ToBackendDeleteGivenRequestDto,
  ToBackendDeleteGivenResponseDto
} from '#backend/controllers/givens/delete-given/delete-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  RoleTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { givensTable } from '#backend/drizzle/postgres/schema/givens';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetApiGivensResultError } from '#common/types/backend/function-errors/get-api-givens-result-error';
import type { GetMemberCheckIsAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-admin-result-error';
import type { GetRolesResultError } from '#common/types/backend/function-errors/get-roles-result-error';
import type { Given } from '#common/types/backend/parts/given/given';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteGivenOutput } from '#common/types/backend/routes/givens/delete-given/delete-given-output';

@ApiTags('Givens')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteGivenController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private givensService: GivensService,
    private rolesService: RolesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendDeleteGiven' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteGiven',
    description: 'Delete a project given'
  })
  @ApiOkResponse({
    type: ToBackendDeleteGivenResponseDto
  })
  async deleteGiven(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteGivenRequestDto
  ): Promise<BackendResultForOperation<'deleteGiven'>> {
    return Result.pipe(
      Result.succeed({
        ...body.input,
        user: user,
        projectsService: this.projectsService,
        membersService: this.membersService,
        givensService: this.givensService,
        rolesService: this.rolesService,
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
            memberId: v.user.userId,
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        v.givensService.getGivenCheckExistsResult({
          projectId: v.projectId,
          givenId: v.givenId
        })
      ),
      Result.bind(
        'roles',
        (v): Result.ResultAsync<RoleTab[], GetRolesResultError> =>
          v.rolesService.getRolesResult({ projectId: v.projectId })
      ),
      Result.bind(
        'rolesToUpdate',
        (v): Result.Result<RoleTab[], never> =>
          Result.succeed(
            v.roles.filter(role =>
              role.gvs.some(gv => gv.givenId === v.givenId)
            )
          )
      ),
      Result.inspect(v => {
        v.rolesToUpdate.forEach(role => {
          role.gvs = role.gvs.filter(gv => gv.givenId !== v.givenId);
        });
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await v.db.drizzle.transaction(async tx => {
                  await tx
                    .delete(givensTable)
                    .where(
                      and(
                        eq(givensTable.projectId, v.projectId),
                        eq(givensTable.givenId, v.givenId)
                      )
                    );

                  await v.db.packer.write({
                    tx: tx,
                    insertOrUpdate: { roles: v.rolesToUpdate }
                  });
                }),
              getRetryOption(v.cs, v.logger)
            );
          }
        })
      ),
      Result.bind(
        'apiGivens',
        (v): Result.ResultAsync<Given[], GetApiGivensResultError> =>
          v.givensService.getApiGivensResult({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendDeleteGivenOutput => ({
          userMember: v.membersService.tabToApi({ member: v.userMember }),
          givens: v.apiGivens
        })
      )
    );
  }
}
