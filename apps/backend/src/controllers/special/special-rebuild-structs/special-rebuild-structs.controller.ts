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
import { inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSpecialRebuildStructsRequestDto,
  ToBackendSpecialRebuildStructsResponseDto
} from '#backend/controllers/special/special-rebuild-structs/special-rebuild-structs.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  ProjectTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import {
  BlockmlService,
  type RebuildStructOutput
} from '#backend/services/blockml/blockml.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { isUndefinedOrEmpty } from '#common/functions/is-undefined-or-empty/is-undefined-or-empty';
import { makeId } from '#common/functions/make-id/make-id';
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { MemberEntToTabError } from '#common/types/backend/function-errors/member-ent-to-tab-error';
import type { ProjectEntToTabError } from '#common/types/backend/function-errors/project-ent-to-tab-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { BridgeItem } from '#common/types/backend/parts/special/bridge-item';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSpecialRebuildStructsOutput } from '#common/types/backend/routes/special/special-rebuild-structs/special-rebuild-structs-output';
import type { ToDiskGetCatalogFilesOutput } from '#common/types/disk/routes/catalogs/get-catalog-files/get-catalog-files-output';

type PrepareRebuildPayload = {
  notFoundProjectIds: string[];
  errorGetCatalogBridgeItems: BridgeItem[];
  successBridgeItems: BridgeItem[];
};

@ApiTags('Special')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Throttle({
  '1s': {
    limit: 3 * THROTTLE_MULTIPLIER
  },
  '5s': {
    limit: 5 * THROTTLE_MULTIPLIER
  },
  '60s': {
    limit: 99999 * THROTTLE_MULTIPLIER
  },
  '600s': {
    limit: 99999 * THROTTLE_MULTIPLIER
  }
})
@Controller()
export class SpecialRebuildStructsController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private blockmlService: BlockmlService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendSpecialRebuildStructs' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SpecialRebuildStructs',
    description: 'Rebuild state for projects of specified users'
  })
  @ApiOkResponse({
    type: ToBackendSpecialRebuildStructsResponseDto
  })
  async specialRebuildStructs(
    @Body() body: ToBackendSpecialRebuildStructsRequestDto
  ): Promise<BackendResultForOperation<'specialRebuildStructs'>> {
    return Result.pipe(
      Result.succeed({
        traceId: body.traceId,
        specialKey: body.input.specialKey,
        userIds: body.input.userIds,
        skipRebuild: body.input.skipRebuild,
        overrideTimezone: body.input.overrideTimezone
      }),
      Result.andThrough(v => {
        let envSpecialKey: string =
          this.cs.get<BackendConfig['specialKey']>('specialKey');

        return isUndefinedOrEmpty(v.specialKey) ||
          v.specialKey !== envSpecialKey
          ? Result.fail({ code: 'BACKEND_WRONG_SPECIAL_KEY' })
          : Result.succeed();
      }),
      Result.bind(
        'members',
        async (v): Result.ResultAsync<MemberTab[], MemberEntToTabError> =>
          v.userIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.membersTable
                .findMany({ where: inArray(membersTable.memberId, v.userIds) })
                .then(xs =>
                  Result.sequence(xs, x =>
                    this.tabService.memberEntToTab({
                      memberEnt: x
                    })
                  )
                )
      ),
      Result.bind(
        'projectIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.members.map(member => member.projectId))
      ),
      Result.bind(
        'projects',
        (v): Result.ResultAsync<ProjectTab[], ProjectEntToTabError> =>
          (v.projectIds.length > 0
            ? this.db.drizzle.query.projectsTable.findMany({
                where: inArray(projectsTable.projectId, v.projectIds)
              })
            : this.db.drizzle.select().from(projectsTable)
          ).then(xs =>
            Result.sequence(xs, x =>
              this.tabService.projectEntToTab({ projectEnt: x })
            )
          )
      ),
      Result.bind(
        'bridgeEnts',
        (v): Result.ResultAsync<BridgeEnt[], never> =>
          (v.userIds.length > 0
            ? this.db.drizzle.query.bridgesTable.findMany({
                where: inArray(bridgesTable.repoId, v.userIds)
              })
            : this.db.drizzle.select().from(bridgesTable)
          ).then(bridgeEnts => Result.succeed(bridgeEnts))
      ),
      Result.bind(
        'prepareRebuildPayload',
        (v): Result.Result<PrepareRebuildPayload, never> =>
          Result.succeed({
            notFoundProjectIds: [],
            errorGetCatalogBridgeItems: [],
            successBridgeItems: []
          })
      ),
      Result.andThrough(v =>
        Result.sequence(
          v.bridgeEnts,
          async (
            bridgeEnt
          ): Result.ResultAsync<void, RebuildStructError | DbErrorToError> => {
            let project: ProjectTab = v.projects.find(
              project => project.projectId === bridgeEnt.projectId
            );

            if (isUndefined(project)) {
              v.prepareRebuildPayload.notFoundProjectIds.push(
                bridgeEnt.projectId
              );

              return Result.succeed();
            }

            let bridgeItem: BridgeItem = {
              orgId: project.orgId,
              projectId: project.projectId,
              repoId: bridgeEnt.repoId,
              branchId: bridgeEnt.branchId,
              envId: bridgeEnt.envId,
              structId: bridgeEnt.structId,
              needValidate: bridgeEnt.needValidate
            };

            if (v.skipRebuild === false) {
              let diskResult: Result.Result<
                ToDiskGetCatalogFilesOutput,
                SendToDiskError
              > = await this.rpcService.sendToDisk({
                request: {
                  operation: 'getCatalogFiles',
                  traceId: v.traceId,
                  input: {
                    baseProject: this.tabService.projectTabToBaseProject({
                      project: project
                    }),
                    repoId: bridgeEnt.repoId,
                    branch: bridgeEnt.branchId
                  }
                }
              });

              if (Result.isFailure(diskResult)) {
                // The delegating RPC wrapper uses Error (not ServerError) for the
                // nested cause, so the legacy per-bridge message is the outer code.
                bridgeItem.errorMessage = diskResult.error.code;

                v.prepareRebuildPayload.errorGetCatalogBridgeItems.push(
                  bridgeItem
                );

                return Result.succeed();
              }

              let structId: string = makeId();

              let rebuildResult: Result.Result<
                RebuildStructOutput,
                RebuildStructError
              > = await this.blockmlService.rebuildStruct({
                traceId: v.traceId,
                orgId: project.orgId,
                projectId: project.projectId,
                repoId: bridgeEnt.repoId,
                structId: structId,
                diskFiles: diskResult.value.files,
                mproveDir: diskResult.value.mproveDir,
                envId: bridgeEnt.envId,
                selectedGivens: [],
                overrideTimezone: v.overrideTimezone
              });

              if (Result.isFailure(rebuildResult)) {
                return rebuildResult;
              }

              bridgeEnt.structId = structId;
              bridgeEnt.needValidate = false;
            } else {
              bridgeEnt.structId = EMPTY_STRUCT_ID;
              bridgeEnt.needValidate = true;
            }

            let writeResult: Result.Result<void, DbErrorToError> =
              await dbErrorToResult({
                action: async () => {
                  await retry(
                    async () =>
                      await this.db.drizzle.transaction(
                        async tx =>
                          await this.db.packer.write({
                            tx: tx,
                            insertOrUpdate: { bridges: [bridgeEnt] }
                          })
                      ),
                    getRetryOption(this.cs, this.logger)
                  );
                }
              });

            if (Result.isFailure(writeResult)) {
              return writeResult;
            }

            bridgeItem.structId = bridgeEnt.structId;
            bridgeItem.needValidate = bridgeEnt.needValidate;

            v.prepareRebuildPayload.successBridgeItems.push(bridgeItem);

            return Result.succeed();
          }
        )
      ),
      Result.map(
        (v): ToBackendSpecialRebuildStructsOutput => ({
          notFoundProjectIds: v.prepareRebuildPayload.notFoundProjectIds,
          successTotal: v.prepareRebuildPayload.successBridgeItems.length,
          errorTotal: v.prepareRebuildPayload.errorGetCatalogBridgeItems.length,
          successBridgeItems: v.prepareRebuildPayload.successBridgeItems,
          errorGetCatalogBridgeItems:
            v.prepareRebuildPayload.errorGetCatalogBridgeItems
        })
      )
    );
  }
}
