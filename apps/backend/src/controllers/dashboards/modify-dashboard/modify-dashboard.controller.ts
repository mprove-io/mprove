import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { dashboardsTable } from '~backend/drizzle/postgres/schema/dashboards';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeDashboardFileText } from '~backend/functions/make-dashboard-file-text';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class ModifyDashboardController {
  constructor(
    private branchesService: BranchesService,
    private structsService: StructsService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private modelsService: ModelsService,
    private dashboardsService: DashboardsService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private wrapToEntService: WrapToEntService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyDashboard)
  async createEmptyDashboard(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendModifyDashboardRequest = request.body;

    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      toDashboardId,
      fromDashboardId,
      selectedTileTitle,
      newTile,
      isReplaceTile,
      accessUsers,
      accessRoles,
      dashboardTitle,
      tilesGrid
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    if (member.isExplorer === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_IS_NOT_EXPLORER
      });
    }

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let firstProjectId =
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (
      member.isAdmin === false &&
      projectId === firstProjectId &&
      repoId === common.PROD_REPO_ID
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let fromDashboardEntity =
      await this.dashboardsService.getDashboardCheckExists({
        structId: bridge.structId,
        dashboardId: fromDashboardId
      });

    let fromDashboard = await this.dashboardsService.getDashboardXCheckAccess({
      user: user,
      member: member,
      dashboard: fromDashboardEntity,
      bridge: bridge,
      projectId: projectId
    });

    let toDashboardEntity =
      await this.dashboardsService.getDashboardCheckExists({
        structId: bridge.structId,
        dashboardId: toDashboardId
      });

    if (member.isAdmin === false && member.isEditor === false) {
      this.dashboardsService.checkDashboardPath({
        userAlias: user.alias,
        filePath: toDashboardEntity.filePath
      });
    }

    // let toDashboard = await this.dashboardsService.getDashboardXCheckAccess({
    //   user: user,
    //   member: member,
    //   dashboard: toDashboardEntity,
    //   bridge: bridge,
    //   projectId: projectId
    // });

    let dashboardFileText: string;

    if (common.isDefined(newTile)) {
      let mconfigModel = await this.modelsService.getModelCheckExists({
        structId: bridge.structId,
        modelId: newTile.mconfig.modelId
      });

      let isAccessGranted = helper.checkAccess({
        userAlias: user.alias,
        member: member,
        entity: mconfigModel
      });

      if (isAccessGranted === false) {
        throw new common.ServerError({
          message: common.ErEnum.BACKEND_FORBIDDEN_MODEL
        });
      }

      newTile.mconfig.chart.title = newTile.title;

      let plateY = 0;

      fromDashboard.tiles.forEach(tile => {
        plateY = plateY + tile.plateHeight;
      });

      newTile.plateY = plateY;

      if (isReplaceTile === true) {
        let oldTileIndex = fromDashboard.tiles.findIndex(
          x => x.title === selectedTileTitle
        );

        let oldTile = fromDashboard.tiles[oldTileIndex];

        newTile.plateWidth = oldTile.plateWidth;
        newTile.plateHeight = oldTile.plateHeight;
        newTile.plateX = oldTile.plateX;
        newTile.plateY = oldTile.plateY;

        fromDashboard.tiles[oldTileIndex] = newTile;
      } else {
        fromDashboard.tiles = [...fromDashboard.tiles, newTile];
      }

      dashboardFileText = makeDashboardFileText({
        dashboard: fromDashboard,
        newDashboardId: fromDashboard.dashboardId,
        newTitle: fromDashboard.title,
        roles: fromDashboard.accessRoles.join(', '),
        users: fromDashboard.accessUsers.join(', '),
        deleteFilterFieldId: undefined,
        deleteFilterTileTitle: undefined,
        timezone: common.UTC,
        caseSensitiveStringFilters: currentStruct.caseSensitiveStringFilters
      });
    } else {
      // dashboard save as - replace existing
      let yTiles: common.TileX[] = [];

      tilesGrid.forEach(freshTile => {
        let yTile = fromDashboard.tiles.find(y => freshTile.title === y.title);

        yTile.plateX = freshTile.plateX;
        yTile.plateY = freshTile.plateY;
        yTile.plateWidth = freshTile.plateWidth;
        yTile.plateHeight = freshTile.plateHeight;

        yTiles.push(yTile);
      });

      fromDashboard.tiles = yTiles;

      dashboardFileText = makeDashboardFileText({
        dashboard: fromDashboard,
        newDashboardId: toDashboardId,
        newTitle: dashboardTitle,
        roles: accessRoles,
        users: accessUsers,
        deleteFilterFieldId: undefined,
        deleteFilterTileTitle: undefined,
        timezone: common.UTC,
        caseSensitiveStringFilters: currentStruct.caseSensitiveStringFilters
      });
    }

    let toDiskSaveFileRequest: apiToDisk.ToDiskSaveFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        fileNodeId: toDashboardEntity.filePath,
        userAlias: user.alias,
        content: dashboardFileText,
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskSaveFileResponse>({
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskSaveFileRequest,
        checkIsOk: true
      });

    let branchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, branch.projectId),
        eq(bridgesTable.repoId, branch.repoId),
        eq(bridgesTable.branchId, branch.branchId)
      )
    });

    // let branchBridges = await this.bridgesRepository.find({
    //   where: {
    //     project_id: branch.project_id,
    //     repo_id: branch.repo_id,
    //     branch_id: branch.branch_id
    //   }
    // });

    await forEachSeries(branchBridges, async x => {
      if (x.envId !== envId) {
        x.structId = common.EMPTY_STRUCT_ID;
        x.needValidate = true;
      }
    });

    let { struct, dashboards, mconfigs, queries } =
      await this.blockmlService.rebuildStruct({
        traceId: traceId,
        orgId: project.orgId,
        projectId: projectId,
        structId: bridge.structId,
        diskFiles: diskResponse.payload.files,
        mproveDir: diskResponse.payload.mproveDir,
        skipDb: true,
        envId: envId,
        overrideTimezone: undefined
      });

    let newDashboard = dashboards.find(x => x.dashboardId === toDashboardId);

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          if (common.isUndefined(newDashboard)) {
            await tx
              .delete(dashboardsTable)
              .where(
                and(
                  eq(dashboardsTable.dashboardId, toDashboardId),
                  eq(dashboardsTable.structId, bridge.structId)
                )
              );

            // await this.dashboardsRepository.delete({
            //   dashboard_id: toDashboardId,
            //   struct_id: bridge.struct_id
            // });

            let fileIdAr = toDashboardEntity.filePath.split('/');
            fileIdAr.shift();
            let underscoreFileId = fileIdAr.join(common.TRIPLE_UNDERSCORE);

            throw new common.ServerError({
              message: common.ErEnum.BACKEND_MODIFY_DASHBOARD_FAIL,
              data: {
                underscoreFileId: underscoreFileId
              }
            });
          }

          let dashboardMconfigIds = newDashboard.tiles.map(x => x.mconfigId);
          let dashboardMconfigs = mconfigs.filter(
            x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
          );

          let dashboardQueryIds = newDashboard.tiles.map(x => x.queryId);
          let dashboardQueries = queries.filter(
            x => dashboardQueryIds.indexOf(x.queryId) > -1
          );

          await this.db.packer.write({
            tx: tx,
            insert: {
              mconfigs: dashboardMconfigs.map(x =>
                this.wrapToEntService.wrapToEntityMconfig(x)
              )
            },
            insertOrUpdate: {
              dashboards: common.isDefined(newDashboard)
                ? [this.wrapToEntService.wrapToEntityDashboard(newDashboard)]
                : undefined,
              structs: [struct],
              bridges: [...branchBridges]
            },
            insertOrDoNothing: {
              queries: dashboardQueries.map(x =>
                this.wrapToEntService.wrapToEntityQuery(x)
              )
            }
          });

          // await this.dbService.writeRecords({
          //   modify: true,
          //   records: {
          //     dashboards: common.isDefined(newDashboard)
          //       ? [wrapper.wrapToEntityDashboard(newDashboard)]
          //       : undefined,
          //     structs: [struct],
          //     bridges: [...branchBridges]
          //   }
          // });

          // await this.dbService.writeRecords({
          //   modify: false,
          //   records: {
          //     mconfigs: dashboardMconfigs.map(x =>
          //       wrapper.wrapToEntityMconfig(x)
          //     ),
          //     queries: dashboardQueries.map(x => wrapper.wrapToEntityQuery(x))
          //   }
          // });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
