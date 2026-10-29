import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendDeleteRecordsRequestDto,
  ToBackendDeleteRecordsResponseDto
} from '#backend/controllers/test-routes/delete-records/delete-records.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { avatarsTable } from '#backend/drizzle/postgres/tables/avatars';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { cachedColumnsTable } from '#backend/drizzle/postgres/tables/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/tables/cached-parts';
import { chartsTable } from '#backend/drizzle/postgres/tables/charts';
import { connectionsTable } from '#backend/drizzle/postgres/tables/connections';
import { dashboardsTable } from '#backend/drizzle/postgres/tables/dashboards';
import { envsTable } from '#backend/drizzle/postgres/tables/envs';
import { givensTable } from '#backend/drizzle/postgres/tables/givens';
import { kitsTable } from '#backend/drizzle/postgres/tables/kits';
import { mconfigsTable } from '#backend/drizzle/postgres/tables/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { modelFieldLeafsTable } from '#backend/drizzle/postgres/tables/model-field-leafs';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { orgsTable } from '#backend/drizzle/postgres/tables/orgs';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { providersTable } from '#backend/drizzle/postgres/tables/providers';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import { reportsTable } from '#backend/drizzle/postgres/tables/reports';
import { sessionsTable } from '#backend/drizzle/postgres/tables/sessions';
import { structsTable } from '#backend/drizzle/postgres/tables/structs';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { usersTable } from '#backend/drizzle/postgres/tables/users';
import { getDconfigHashSecret } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret/get-dconfig-hash-secret';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { TestRoutesGuard } from '#backend/guards/test-routes/test-routes.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { DbUsersFindFirstError } from '#common/types/backend/function-errors/db/users/db-users-find-first-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteRecordsOutput } from '#common/types/backend/routes/test-routes/delete-records/delete-records-output';
import { customAsyncPool } from '#node-common/functions/custom-async-pool/custom-async-pool';

@ApiTags('TestRoutes')
@SkipJwtCheck()
@SkipThrottle()
@UseGuards(TestRoutesGuard)
@Controller()
export class DeleteRecordsController {
  constructor(
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteRecords' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteRecords',
    description: 'Delete test orgs, projects, users and related records'
  })
  @ApiOkResponse({
    type: ToBackendDeleteRecordsResponseDto
  })
  async deleteRecords(
    @Body() body: ToBackendDeleteRecordsRequestDto
  ): Promise<BackendResultForOperation<'deleteRecords'>> {
    return Result.pipe(
      Result.succeed({
        requestedOrgIds: body.input.orgIds || [],
        requestedProjectIds: body.input.projectIds || [],
        emails: body.input.emails || [],
        orgNames: body.input.orgNames,
        projectNames: body.input.projectNames,
        requestedStructIds: body.input.structIds
          ? [...body.input.structIds]
          : [],
        traceId: body.traceId
      }),
      Result.bind('hashSecret', v => getDconfigHashSecret({ db: this.db })),
      Result.bind('projectNameHashes', v =>
        Result.sequence(v.projectNames || [], projectName =>
          makeHash({
            input: projectName,
            hashSecret: v.hashSecret
          })
        )
      ),
      Result.bind('matchingProjects', async v =>
        v.projectNameHashes.length === 0
          ? Result.succeed([])
          : this.db.projects.findMany({
              where: and(
                inArray(projectsTable.orgId, v.requestedOrgIds),
                inArray(projectsTable.nameHash, v.projectNameHashes)
              )
            })
      ),
      Result.bind('projectIds', v =>
        Result.succeed<string[]>([
          ...v.requestedProjectIds,
          ...v.matchingProjects.map(project => project.projectId)
        ])
      ),
      Result.bind('orgNameHashes', v =>
        Result.sequence(v.orgNames || [], orgName =>
          makeHash({
            input: orgName,
            hashSecret: v.hashSecret
          })
        )
      ),
      Result.bind('matchingOrgs', async v =>
        v.orgNameHashes.length === 0
          ? Result.succeed([])
          : this.db.orgs.findMany({
              where: inArray(orgsTable.nameHash, v.orgNameHashes)
            })
      ),
      Result.bind('orgIds', v =>
        Result.succeed<string[]>([
          ...v.requestedOrgIds,
          ...v.matchingOrgs.map(org => org.orgId)
        ])
      ),
      Result.andThrough(v =>
        v.orgIds.length === 0
          ? Result.succeed()
          : customAsyncPool({
              poolSize: 1,
              inputs: v.orgIds,
              callback: orgId =>
                this.rpcService.sendToDisk({
                  request: {
                    operation: 'deleteOrg',
                    traceId: v.traceId,
                    input: { orgId: orgId }
                  }
                })
            })
      ),
      Result.bind('matchingUserIds', async v =>
        v.emails.length === 0
          ? Result.succeed([])
          : customAsyncPool({
              poolSize: 1,
              inputs: v.emails,
              callback: async (
                email: string
              ): Result.ResultAsync<
                string,
                MakeHashError | DbUsersFindFirstError
              > => {
                let emailHashResult: Result.Result<string, MakeHashError> =
                  makeHash({
                    input: email,
                    hashSecret: v.hashSecret
                  });

                if (Result.isFailure(emailHashResult)) {
                  return emailHashResult;
                }

                let userResult: Result.Result<UserTab, DbUsersFindFirstError> =
                  await this.db.users.findFirst({
                    where: eq(usersTable.emailHash, emailHashResult.value)
                  });

                if (Result.isFailure(userResult)) {
                  return userResult;
                }

                return Result.succeed(userResult.value?.userId);
              }
            })
      ),
      Result.bind('userIds', v =>
        Result.succeed<string[]>(
          v.matchingUserIds.filter(userId => isDefined(userId))
        )
      ),
      Result.bind('structs', async v =>
        v.projectIds.length === 0
          ? Result.succeed([])
          : this.db.structs.findMany({
              where: inArray(structsTable.projectId, v.projectIds)
            })
      ),
      Result.bind('structIds', v =>
        Result.succeed<string[]>([
          ...v.requestedStructIds,
          ...v.structs.map(struct => struct.structId)
        ])
      ),
      Result.andThrough(async v => {
        await retry(
          async () =>
            await this.db.drizzle.transaction(async tx => {
              if (v.userIds.length > 0) {
                await tx
                  .delete(usersTable)
                  .where(inArray(usersTable.userId, v.userIds));

                await tx
                  .delete(avatarsTable)
                  .where(inArray(avatarsTable.userId, v.userIds));

                await tx
                  .delete(membersTable)
                  .where(inArray(membersTable.memberId, v.userIds));
              }

              if (v.orgIds.length > 0) {
                await tx
                  .delete(orgsTable)
                  .where(inArray(orgsTable.orgId, v.orgIds));
              }

              if (v.projectIds.length > 0) {
                await tx
                  .delete(projectsTable)
                  .where(inArray(projectsTable.projectId, v.projectIds));

                await tx
                  .delete(connectionsTable)
                  .where(inArray(connectionsTable.projectId, v.projectIds));

                await tx
                  .delete(providersTable)
                  .where(inArray(providersTable.projectId, v.projectIds));

                await tx
                  .delete(branchesTable)
                  .where(inArray(branchesTable.projectId, v.projectIds));

                await tx
                  .delete(bridgesTable)
                  .where(inArray(bridgesTable.projectId, v.projectIds));

                await tx
                  .delete(envsTable)
                  .where(inArray(envsTable.projectId, v.projectIds));

                await tx
                  .delete(givensTable)
                  .where(inArray(givensTable.projectId, v.projectIds));

                await tx
                  .delete(queriesTable)
                  .where(inArray(queriesTable.projectId, v.projectIds));

                await tx
                  .delete(sessionsTable)
                  .where(inArray(sessionsTable.projectId, v.projectIds));

                await tx
                  .delete(cachedPartsTable)
                  .where(inArray(cachedPartsTable.projectId, v.projectIds));

                await tx
                  .delete(cachedColumnsTable)
                  .where(inArray(cachedColumnsTable.projectId, v.projectIds));
              }

              if (v.structIds.length > 0) {
                await tx
                  .delete(structsTable)
                  .where(inArray(structsTable.structId, v.structIds));

                await tx
                  .delete(modelsTable)
                  .where(inArray(modelsTable.structId, v.structIds));

                await tx
                  .delete(modelFieldLeafsTable)
                  .where(inArray(modelFieldLeafsTable.structId, v.structIds));

                await tx
                  .delete(chartsTable)
                  .where(inArray(chartsTable.structId, v.structIds));

                await tx
                  .delete(dashboardsTable)
                  .where(inArray(dashboardsTable.structId, v.structIds));

                await this.db.drizzle
                  .delete(reportsTable)
                  .where(inArray(reportsTable.structId, v.structIds));

                await this.db.drizzle
                  .delete(kitsTable)
                  .where(inArray(kitsTable.structId, v.structIds));

                await tx
                  .delete(mconfigsTable)
                  .where(inArray(mconfigsTable.structId, v.structIds));
              }
            }),
          getRetryOption(this.cs, this.logger)
        );

        return Result.succeed();
      }),
      Result.map((v): ToBackendDeleteRecordsOutput => ({}))
    );
  }
}
