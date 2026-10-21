import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteOrgRequestDto,
  ToBackendDeleteOrgResponseDto
} from '#backend/controllers/orgs/delete-org/delete-org.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { envsTable } from '#backend/drizzle/postgres/schema/envs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteOrgOutput } from '#common/types/backend/routes/orgs/delete-org/delete-org-output';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteOrgController {
  constructor(
    private orgsService: OrgsService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteOrg' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteOrg',
    description: 'Delete an organization and all its projects'
  })
  @ApiOkResponse({
    type: ToBackendDeleteOrgResponseDto
  })
  async deleteOrg(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteOrgRequestDto
  ): Promise<BackendResultForOperation<'deleteOrg'>> {
    return Result.pipe(
      Result.succeed({
        orgId: body.input.orgId,
        userId: user.userId,
        traceId: body.traceId
      }),
      Result.bind('org', v =>
        this.db.orgs.findFirstCheckExists({
          where: eq(orgsTable.orgId, v.orgId)
        })
      ),
      Result.andThrough(v =>
        this.orgsService.checkUserIsOrgOwner({
          org: v.org,
          userId: v.userId
        })
      ),
      Result.andThrough(v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'deleteOrg',
            traceId: v.traceId,
            input: { orgId: v.org.orgId }
          }
        })
      ),
      Result.bind('projects', v =>
        this.db.projects.findMany({
          where: eq(projectsTable.orgId, v.orgId)
        })
      ),
      Result.bind('projectIds', v =>
        Result.succeed(v.projects.map(project => project.projectId))
      ),
      Result.andThrough(async v => {
        await retry(
          async () =>
            await this.db.drizzle.transaction(async tx => {
              await tx.delete(orgsTable).where(eq(orgsTable.orgId, v.orgId));

              if (v.projectIds.length > 0) {
                await tx
                  .delete(projectsTable)
                  .where(inArray(projectsTable.projectId, v.projectIds));

                await tx
                  .delete(membersTable)
                  .where(inArray(membersTable.projectId, v.projectIds));

                await tx
                  .delete(connectionsTable)
                  .where(inArray(connectionsTable.projectId, v.projectIds));

                await tx
                  .delete(envsTable)
                  .where(inArray(envsTable.projectId, v.projectIds));

                await tx
                  .delete(branchesTable)
                  .where(inArray(branchesTable.projectId, v.projectIds));

                await tx
                  .delete(bridgesTable)
                  .where(inArray(bridgesTable.projectId, v.projectIds));

                await tx
                  .delete(cachedPartsTable)
                  .where(inArray(cachedPartsTable.projectId, v.projectIds));

                await tx
                  .delete(cachedColumnsTable)
                  .where(inArray(cachedColumnsTable.projectId, v.projectIds));
              }
            }),
          getRetryOption(this.cs, this.logger)
        );

        return Result.succeed();
      }),
      Result.map((v): ToBackendDeleteOrgOutput => ({}))
    );
  }
}
