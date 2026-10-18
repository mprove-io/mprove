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
import { SkipThrottle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteRecordsRequestDto,
  ToBackendDeleteRecordsResponseDto
} from '#backend/controllers/test-routes/delete-records/delete-records.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import { avatarsTable } from '#backend/drizzle/postgres/schema/avatars';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { dashboardsTable } from '#backend/drizzle/postgres/schema/dashboards';
import { envsTable } from '#backend/drizzle/postgres/schema/envs';
import { givensTable } from '#backend/drizzle/postgres/schema/givens';
import { kitsTable } from '#backend/drizzle/postgres/schema/kits';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelFieldLeafsTable } from '#backend/drizzle/postgres/schema/model-field-leafs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { type OrgEnt, orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import {
  type ProjectEnt,
  projectsTable
} from '#backend/drizzle/postgres/schema/projects';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import {
  type StructEnt,
  structsTable
} from '#backend/drizzle/postgres/schema/structs';
import {
  type UserEnt,
  usersTable
} from '#backend/drizzle/postgres/schema/users';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { TestRoutesGuard } from '#backend/guards/test-routes/test-routes.guard';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { HashService } from '#backend/services/hash/hash.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteRecordsOutput } from '#common/types/backend/routes/test-routes/delete-records/delete-records-output';
import { asyncPoolResult } from '#node-common/functions/async-pool-result/async-pool-result';

@ApiTags('TestRoutes')
@SkipJwtCheck()
@SkipThrottle()
@UseGuards(TestRoutesGuard)
@Controller()
export class DeleteRecordsController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretError> =>
          this.dconfigsService.getDconfigHashSecret()
      ),
      Result.bind(
        'projectNameHashes',
        (v): Result.Result<string[], MakeHashError> =>
          Result.sequence(v.projectNames || [], projectName =>
            this.hashService.makeHash({
              input: projectName,
              hashSecret: v.hashSecret
            })
          )
      ),
      Result.bind(
        'projectIds',
        async (v): Result.ResultAsync<string[], never> => {
          if (v.projectNameHashes.length === 0) {
            return Result.succeed(v.requestedProjectIds);
          }

          let projectEnts: ProjectEnt[] =
            await this.db.drizzle.query.projectsTable.findMany({
              where: and(
                inArray(projectsTable.orgId, v.requestedOrgIds),
                inArray(projectsTable.nameHash, v.projectNameHashes)
              )
            });

          return Result.succeed([
            ...v.requestedProjectIds,
            ...projectEnts.map(projectEnt => projectEnt.projectId)
          ]);
        }
      ),
      Result.bind(
        'orgNameHashes',
        (v): Result.Result<string[], MakeHashError> =>
          Result.sequence(v.orgNames || [], orgName =>
            this.hashService.makeHash({
              input: orgName,
              hashSecret: v.hashSecret
            })
          )
      ),
      Result.bind('orgIds', async (v): Result.ResultAsync<string[], never> => {
        if (v.orgNameHashes.length === 0) {
          return Result.succeed(v.requestedOrgIds);
        }

        let orgEnts: OrgEnt[] = await this.db.drizzle.query.orgsTable.findMany({
          where: inArray(orgsTable.nameHash, v.orgNameHashes)
        });

        return Result.succeed([
          ...v.requestedOrgIds,
          ...orgEnts.map(orgEnt => orgEnt.orgId)
        ]);
      }),
      Result.andThrough(v =>
        v.orgIds.length === 0
          ? Result.succeed()
          : asyncPoolResult({
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
      Result.bind(
        'matchingUserIds',
        async (v): Result.ResultAsync<string[], MakeHashError> =>
          v.emails.length === 0
            ? Result.succeed([])
            : asyncPoolResult({
                poolSize: 1,
                inputs: v.emails,
                callback: async email => {
                  let emailHashResult: Result.Result<string, MakeHashError> =
                    this.hashService.makeHash({
                      input: email,
                      hashSecret: v.hashSecret
                    });

                  if (Result.isFailure(emailHashResult)) {
                    return emailHashResult;
                  }

                  let userEnt: UserEnt =
                    await this.db.drizzle.query.usersTable.findFirst({
                      where: eq(usersTable.emailHash, emailHashResult.value)
                    });

                  return Result.succeed(userEnt?.userId);
                }
              })
      ),
      Result.bind(
        'userIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.matchingUserIds.filter(userId => isDefined(userId)))
      ),
      Result.bind(
        'structEnts',
        async (v): Result.ResultAsync<StructEnt[], never> =>
          v.projectIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.structsTable
                .findMany({
                  where: inArray(structsTable.projectId, v.projectIds)
                })
                .then(xs => Result.succeed(xs))
      ),
      Result.bind(
        'structIds',
        (v): Result.Result<string[], never> =>
          Result.succeed([
            ...v.requestedStructIds,
            ...v.structEnts.map(structEnt => structEnt.structId)
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
