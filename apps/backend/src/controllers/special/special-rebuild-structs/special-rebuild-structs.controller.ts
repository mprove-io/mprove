import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendSpecialRebuildStructsRequestDto,
  ToBackendSpecialRebuildStructsResponseDto
} from '#backend/controllers/special/special-rebuild-structs/special-rebuild-structs.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import type { BridgeTab } from '#backend/drizzle/postgres/tables/bridges';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import {
  type RebuildBlockmlStructOutput,
  rebuildBlockmlStruct
} from '#backend/functions/blockml/rebuild-blockml-struct/rebuild-blockml-struct';
import { projectTabToBaseProject } from '#backend/functions/db/projects/project-tab-to-base-project/project-tab-to-base-project';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { isUndefinedOrEmpty } from '#common/functions/is-undefined-or-empty/is-undefined-or-empty';
import { makeId } from '#common/functions/make-id/make-id';
import type { DbErrorToError } from '#common/types/backend/function-errors/db/db-error-to-error';
import type { RebuildBlockmlStructError } from '#common/types/backend/function-errors/rebuild-blockml-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
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
    private cs: ConfigService<BackendConfig>,
    private db: DbService,
    private logger: Logger
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
      Result.bind('members', async v =>
        v.userIds.length === 0
          ? Result.succeed([])
          : this.db.members.findMany({
              where: inArray(membersTable.memberId, v.userIds)
            })
      ),
      Result.bind('projectIds', v =>
        Result.succeed(v.members.map(member => member.projectId))
      ),
      Result.bind('projects', v =>
        v.projectIds.length > 0
          ? this.db.projects.findMany({
              where: inArray(projectsTable.projectId, v.projectIds)
            })
          : this.db.drizzle
              .select()
              .from(projectsTable)
              .then(xs =>
                Result.sequence(xs, x => this.db.projects.entToTab({ ent: x }))
              )
      ),
      Result.bind('bridges', v =>
        v.userIds.length > 0
          ? this.db.bridges.findMany({
              where: inArray(bridgesTable.repoId, v.userIds)
            })
          : this.db.drizzle
              .select()
              .from(bridgesTable)
              .then(xs =>
                Result.sequence(xs, x => this.db.bridges.entToTab({ ent: x }))
              )
      ),
      Result.bind('prepareRebuildPayload', v => {
        let prepareRebuildPayload: PrepareRebuildPayload = {
          notFoundProjectIds: [],
          errorGetCatalogBridgeItems: [],
          successBridgeItems: []
        };

        return Result.succeed(prepareRebuildPayload);
      }),
      Result.andThrough(v =>
        Result.sequence(
          v.bridges,
          async (
            bridge: BridgeTab
          ): Result.ResultAsync<
            void,
            RebuildBlockmlStructError | DbErrorToError
          > => {
            let project: ProjectTab = v.projects.find(
              project => project.projectId === bridge.projectId
            );

            if (isUndefined(project)) {
              v.prepareRebuildPayload.notFoundProjectIds.push(bridge.projectId);

              return Result.succeed();
            }

            let bridgeItem: BridgeItem = {
              orgId: project.orgId,
              projectId: project.projectId,
              repoId: bridge.repoId,
              branchId: bridge.branchId,
              envId: bridge.envId,
              structId: bridge.structId,
              needValidate: bridge.needValidate
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
                    baseProject: projectTabToBaseProject({
                      tabService: this.tabService,
                      project: project
                    }),
                    repoId: bridge.repoId,
                    branch: bridge.branchId
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
                RebuildBlockmlStructOutput,
                RebuildBlockmlStructError
              > = await rebuildBlockmlStruct({
                traceId: v.traceId,
                orgId: project.orgId,
                projectId: project.projectId,
                repoId: bridge.repoId,
                structId: structId,
                diskFiles: diskResult.value.files,
                mproveDir: diskResult.value.mproveDir,
                envId: bridge.envId,
                selectedGivens: [],
                overrideTimezone: v.overrideTimezone,
                db: this.db,
                tabService: this.tabService,
                rpcService: this.rpcService,
                cs: this.cs,
                logger: this.logger
              });

              if (Result.isFailure(rebuildResult)) {
                return rebuildResult;
              }

              bridge.structId = structId;
              bridge.needValidate = false;
            } else {
              bridge.structId = EMPTY_STRUCT_ID;
              bridge.needValidate = true;
            }

            let writeResult: Result.Result<void, WriteError> =
              await this.db.write({
                insertOrUpdate: { bridges: [bridge] }
              });

            if (Result.isFailure(writeResult)) {
              return writeResult;
            }

            bridgeItem.structId = bridge.structId;
            bridgeItem.needValidate = bridge.needValidate;

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
