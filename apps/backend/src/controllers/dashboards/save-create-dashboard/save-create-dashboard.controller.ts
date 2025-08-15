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
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class SaveCreateDashboardController {
  constructor(
    private branchesService: BranchesService,
    private structsService: StructsService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private dashboardsService: DashboardsService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private wrapToEntService: WrapToEntService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveCreateDashboard)
  async saveCreateDashboard(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSaveCreateDashboardRequest =
      request.body;

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
      newDashboardId,
      fromDashboardId,
      dashboardTitle,
      accessRoles,
      tilesGrid
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    if (userMember.isExplorer === false) {
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
      member: userMember
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
      userMember.isAdmin === false &&
      projectId === firstProjectId &&
      repoId === common.PROD_REPO_ID
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let mdir = currentStruct.mproveDirValue;

    if (
      mdir.length > 2 &&
      mdir.substring(0, 2) === common.MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }

    let parentNodeId =
      currentStruct.mproveDirValue === common.MPROVE_CONFIG_DIR_DOT_SLASH
        ? `${projectId}/${common.MPROVE_USERS_FOLDER}/${user.alias}`
        : `${projectId}/${mdir}/${common.MPROVE_USERS_FOLDER}/${user.alias}`;

    let fileName = `${newDashboardId}${common.FileExtensionEnum.Dashboard}`;

    // let malloyFileName = `${newDashboardId}${common.FileExtensionEnum.Malloy}`;

    // let malloyDashboardFilePath = `${parentNodeId}/${malloyFileName}`;

    let dashFileText: string;
    // let secondFileContent: string;

    if (common.isDefined(fromDashboardId)) {
      let fromDashboardEntity =
        await this.dashboardsService.getDashboardCheckExists({
          structId: bridge.structId,
          dashboardId: fromDashboardId
        });

      let fromDashboard = await this.dashboardsService.getDashboardXCheckAccess(
        {
          user: user,
          member: userMember,
          dashboard: fromDashboardEntity,
          bridge: bridge,
          projectId: projectId
        }
      );

      let yTiles: common.TileX[] = [];

      tilesGrid.forEach(freshTile => {
        let yTile = fromDashboard.tiles.find(y => freshTile.title === y.title);

        yTile.plateX = freshTile.plateX;
        yTile.plateY = freshTile.plateY;
        yTile.plateWidth = freshTile.plateWidth;
        yTile.plateHeight = freshTile.plateHeight;

        yTile.listen = freshTile.listen;
        yTile.mconfig.filters = yTile.mconfig.filters.filter(
          k =>
            common.isUndefined(freshTile.deletedFilterFieldIds) ||
            freshTile.deletedFilterFieldIds.indexOf(k.fieldId) < 0
        );

        yTiles.push(yTile);
      });

      fromDashboard.tiles = yTiles;

      let {
        dashboardFileText
        // , malloyFileText
      } = makeDashboardFileText({
        dashboard: fromDashboard,
        newDashboardId: newDashboardId,
        newTitle: dashboardTitle,
        roles: accessRoles,
        caseSensitiveStringFilters: currentStruct.caseSensitiveStringFilters,
        timezone: common.UTC
        // malloyDashboardFilePath: malloyDashboardFilePath
      });

      dashFileText = dashboardFileText;
      // secondFileContent = malloyFileText;
    } else {
      let newDashboard: common.DashboardX = {
        structId: undefined,
        dashboardId: newDashboardId,
        draft: false,
        creatorId: undefined,
        filePath: undefined,
        content: undefined,
        accessRoles: undefined,
        title: undefined,
        hidden: undefined,
        tiles: [],
        author: undefined,
        canEditOrDeleteDashboard: undefined,
        serverTs: undefined,
        extendedFilters: [],
        storeModels: [],
        fields: []
      };

      let {
        dashboardFileText
        // , malloyFileText
      } = makeDashboardFileText({
        dashboard: newDashboard,
        newDashboardId: newDashboardId,
        newTitle: dashboardTitle,
        roles: accessRoles,
        caseSensitiveStringFilters: currentStruct.caseSensitiveStringFilters,
        timezone: common.UTC
        // malloyDashboardFilePath: malloyDashboardFilePath
      });

      dashFileText = dashboardFileText;
      // secondFileContent = malloyFileText;
    }

    let toDiskCreateFileRequest: apiToDisk.ToDiskCreateFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        parentNodeId: parentNodeId,
        fileName: fileName,
        fileText: dashFileText,
        // secondFileName: malloyFileName,
        // secondFileText: secondFileContent,
        userAlias: user.alias,
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateFileResponse>({
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskCreateFileRequest,
        checkIsOk: true
      });

    let branchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, branch.projectId),
        eq(bridgesTable.repoId, branch.repoId),
        eq(bridgesTable.branchId, branch.branchId)
      )
    });

    await forEachSeries(branchBridges, async x => {
      if (x.envId !== envId) {
        x.structId = common.EMPTY_STRUCT_ID;
        x.needValidate = true;
      }
    });

    let { dashboards, mconfigs, queries, struct } =
      await this.blockmlService.rebuildStruct({
        traceId,
        projectId,
        structId: bridge.structId,
        diskFiles: diskResponse.payload.files,
        mproveDir: diskResponse.payload.mproveDir,
        skipDb: true,
        envId: envId,
        overrideTimezone: undefined
      });

    let dashboard = dashboards.find(x => x.dashboardId === newDashboardId);

    if (common.isUndefined(dashboard)) {
      let fileId = `${parentNodeId}/${fileName}`;
      let fileIdAr = fileId.split('/');
      fileIdAr.shift();
      let filePath = fileIdAr.join('/');

      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CREATE_DASHBOARD_FAIL,
        data: {
          encodedFileId: common.encodeFilePath({ filePath: filePath })
        }
      });
    }

    let dashboardMconfigIds = dashboard.tiles.map(x => x.mconfigId);
    let dashboardMconfigs = mconfigs.filter(
      x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
    );

    let dashboardQueryIds = dashboard.tiles.map(x => x.queryId);
    let dashboardQueries = queries.filter(
      x => dashboardQueryIds.indexOf(x.queryId) > -1
    );

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(dashboardsTable)
            .where(
              and(
                eq(dashboardsTable.draft, true),
                eq(dashboardsTable.dashboardId, fromDashboardId),
                eq(dashboardsTable.structId, bridge.structId)
              )
            );

          await this.db.packer.write({
            tx: tx,
            insert: {
              dashboards: [
                this.wrapToEntService.wrapToEntityDashboard(dashboard)
              ],
              mconfigs: dashboardMconfigs.map(x =>
                this.wrapToEntService.wrapToEntityMconfig(x)
              )
            },
            insertOrUpdate: {
              structs: [struct],
              bridges: [...branchBridges]
            },
            insertOrDoNothing: {
              queries: dashboardQueries.map(x =>
                this.wrapToEntService.wrapToEntityQuery(x)
              )
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let newDashboardParts = await this.dashboardsService.getDashboardParts({
      structId: bridge.structId,
      user: user,
      userMember: userMember,
      newDashboard: dashboard
    });

    let payload: apiToBackend.ToBackendSaveCreateDashboardResponsePayload = {
      newDashboardPart:
        newDashboardParts.length > 0 ? newDashboardParts[0] : undefined
    };

    return payload;
  }
}
