import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendDeleteGivenRequestDto,
  ToBackendDeleteGivenResponseDto
} from '#backend/controllers/givens/delete-given/delete-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { givensTable } from '#backend/drizzle/postgres/tables/givens';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { rolesTable } from '#backend/drizzle/postgres/tables/roles';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getApiGivens } from '#backend/functions/db/givens/get-api-givens/get-api-givens';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteGivenOutput } from '#common/types/backend/routes/givens/delete-given/delete-given-output';

@ApiTags('Givens')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteGivenController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
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
        projectId: body.input.projectId,
        givenId: body.input.givenId,
        user: user
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        getMemberCheckIsAdmin({
          memberId: v.user.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        this.db.givens.findFirstCheckExists({
          where: and(
            eq(givensTable.projectId, v.projectId),
            eq(givensTable.givenId, v.givenId)
          )
        })
      ),
      Result.bind('roles', v =>
        this.db.roles.findMany({
          where: eq(rolesTable.projectId, v.projectId)
        })
      ),
      Result.bind('rolesToUpdate', v =>
        Result.succeed(
          v.roles.filter(role => role.gvs.some(gv => gv.givenId === v.givenId))
        )
      ),
      Result.map(v => {
        v.rolesToUpdate.forEach(role => {
          role.gvs = role.gvs.filter(gv => gv.givenId !== v.givenId);
        });
        return v;
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(async tx => {
                  await tx
                    .delete(givensTable)
                    .where(
                      and(
                        eq(givensTable.projectId, v.projectId),
                        eq(givensTable.givenId, v.givenId)
                      )
                    );

                  await this.db.txWriteUnwrap({
                    tx: tx,
                    insertOrUpdate: { roles: v.rolesToUpdate }
                  });
                }),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.bind('apiGivens', v =>
        getApiGivens({ db: this.db, projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendDeleteGivenOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          givens: v.apiGivens
        })
      )
    );
  }
}
