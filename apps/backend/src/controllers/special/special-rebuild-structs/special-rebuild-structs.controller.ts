import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { inArray } from 'drizzle-orm';
import asyncPool from 'tiny-async-pool';
import { BackendConfig } from '#backend/config/backend-config';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BridgeTab,
  MemberTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { BlockmlService } from '#backend/services/blockml.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { isUndefinedOrEmpty } from '#common/functions/is-undefined-or-empty';
import { makeId } from '#common/functions/make-id';
import {
  BridgeItem,
  ToBackendSpecialRebuildStructsRequest,
  ToBackendSpecialRebuildStructsResponsePayload
} from '#common/interfaces/to-backend/special/to-backend-special-rebuild-structs';
import {
  ToDiskGetCatalogFilesRequest,
  ToDiskGetCatalogFilesResponse
} from '#common/interfaces/to-disk/04-catalogs/to-disk-get-catalog-files';
import { ServerError } from '#common/models/server-error';

@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard, ValidateRequestGuard)
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
    private projectsService: ProjectsService,
    private rpcService: RpcService,
    private blockmlService: BlockmlService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSpecialRebuildStructs)
  async specialRebuildStructs(@Req() request: any) {
    let reqValid: ToBackendSpecialRebuildStructsRequest = request.body;

    let { traceId } = reqValid.info;
    let { specialKey, userIds, skipRebuild, overrideTimezone } =
      reqValid.payload;

    let envSpecialKey = this.cs.get<BackendConfig['specialKey']>('specialKey');

    if (isUndefinedOrEmpty(specialKey) || specialKey !== envSpecialKey) {
      throw new ServerError({
        message: ErEnum.BACKEND_WRONG_SPECIAL_KEY
      });
    }

    let projectIds: string[] = [];
    let members: MemberTab[] = [];

    if (userIds.length > 0) {
      members = await this.db.drizzle.query.membersTable
        .findMany({
          where: inArray(membersTable.memberId, userIds)
        })
        .then(xs => xs.map(x => this.tabService.memberEntToTab(x)));

      projectIds = members.map(x => x.projectId);
    }

    let projects =
      projectIds.length > 0
        ? await this.db.drizzle.query.projectsTable
            .findMany({
              where: inArray(projectsTable.projectId, projectIds)
            })
            .then(xs => xs.map(x => this.tabService.projectEntToTab(x)))
        : await this.db.drizzle
            .select()
            .from(projectsTable)
            .then(xs => xs.map(x => this.tabService.projectEntToTab(x)));

    let bridges: BridgeTab[];

    if (userIds.length > 0) {
      bridges = await this.db.drizzle.query.bridgesTable.findMany({
        where: inArray(bridgesTable.repoId, userIds)
      });
    } else {
      bridges = await this.db.drizzle.select().from(bridgesTable);
    }

    let notFoundProjectIds: string[] = [];
    let errorGetCatalogBridgeItems: BridgeItem[] = [];
    let successBridgeItems: BridgeItem[] = [];

    await asyncPool(1, bridges, async bridge => {
      let project = projects.find(x => x.projectId === bridge.projectId);

      if (isUndefined(project)) {
        notFoundProjectIds.push(bridge.projectId);
        return;
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

      if (skipRebuild === false) {
        let baseProject = this.tabService.projectTabToBaseProject({
          project: project
        });

        let toDiskGetCatalogFilesRequest: ToDiskGetCatalogFilesRequest = {
          info: {
            name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
            traceId: reqValid.info.traceId
          },
          payload: {
            orgId: project.orgId,
            baseProject: baseProject,
            repoId: bridge.repoId,
            branch: bridge.branchId
          }
        };

        let getCatalogFilesResponse =
          await this.rpcService.sendToDisk<ToDiskGetCatalogFilesResponse>({
            orgId: project.orgId,
            projectId: project.projectId,
            repoId: bridge.repoId,
            message: toDiskGetCatalogFilesRequest,
            checkIsOk: false
          });

        if (getCatalogFilesResponse.info.status !== ResponseInfoStatusEnum.Ok) {
          bridgeItem.errorMessage = getCatalogFilesResponse.info.error.message;
          errorGetCatalogBridgeItems.push(bridgeItem);
          return;
        }

        let structId = makeId();

        await this.blockmlService.rebuildStruct({
          traceId: traceId,
          orgId: project.orgId,
          projectId: project.projectId,
          repoId: bridge.repoId,
          structId: structId,
          diskFiles: getCatalogFilesResponse.payload.files,
          mproveDir: getCatalogFilesResponse.payload.mproveDir,
          envId: bridge.envId,
          overrideTimezone: overrideTimezone
        });

        bridge.structId = structId;
        bridge.needValidate = false;
      } else {
        bridge.structId = EMPTY_STRUCT_ID;
        bridge.needValidate = true;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  bridges: [bridge]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );

      bridgeItem.structId = bridge.structId;
      bridgeItem.needValidate = bridge.needValidate;

      successBridgeItems.push(bridgeItem);
    });

    let payload: ToBackendSpecialRebuildStructsResponsePayload = {
      notFoundProjectIds: notFoundProjectIds,
      successTotal: successBridgeItems.length,
      errorTotal: errorGetCatalogBridgeItems.length,
      successBridgeItems: successBridgeItems,
      errorGetCatalogBridgeItems: errorGetCatalogBridgeItems
    };

    return payload;
  }
}
