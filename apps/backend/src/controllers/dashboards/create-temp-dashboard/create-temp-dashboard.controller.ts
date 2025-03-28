import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
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
export class CreateTempDashboardController {
  constructor(
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private dashboardsService: DashboardsService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private wrapToEntService: WrapToEntService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempDashboard)
  async createTempDashboard(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendCreateTempDashboardRequest =
      request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      oldDashboardId,
      newDashboardId,
      newDashboardFields,
      tiles,
      deleteFilterFieldId,
      deleteFilterTileTitle,
      timezone
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

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

    let fromDashboardEntity =
      await this.dashboardsService.getDashboardCheckExists({
        structId: bridge.structId,
        dashboardId: oldDashboardId
      });

    let fromDashboard = await this.dashboardsService.getDashboardXCheckAccess({
      user: user,
      member: userMember,
      dashboard: fromDashboardEntity,
      bridge: bridge,
      projectId: projectId
    });

    let yTiles: common.TileX[] = [];

    tiles.forEach(freshTile => {
      let yTile = fromDashboard.tiles.find(y => freshTile.title === y.title);

      yTile.plateX = freshTile.plateX;
      yTile.plateY = freshTile.plateY;
      yTile.plateWidth = freshTile.plateWidth;
      yTile.plateHeight = freshTile.plateHeight;

      yTile.listen = freshTile.listen;

      yTiles.push(yTile);
    });

    fromDashboard.tiles = yTiles;
    fromDashboard.fields = newDashboardFields;

    // console.log('newDashboardFields');
    // newDashboardFields.forEach(dashboardField => {
    //   console.log('dashboardField');
    //   console.log(dashboardField);
    //   dashboardField.fractions.forEach(fraction => {
    //     console.log('fraction');
    //     console.log(fraction);
    //     fraction.controls.forEach(control => {
    //       console.log('control');
    //       console.log(control);
    //     });
    //   });
    // });

    let dashboardFileText = makeDashboardFileText({
      dashboard: fromDashboard,
      newDashboardId: newDashboardId,
      newTitle: fromDashboard.title,
      roles: fromDashboard.accessRoles.join(', '),
      users: fromDashboard.accessUsers.join(', '),
      deleteFilterFieldId: deleteFilterFieldId,
      deleteFilterTileTitle: deleteFilterTileTitle,
      caseSensitiveStringFilters: currentStruct.caseSensitiveStringFilters,
      timezone: common.UTC
    });

    // console.log('dashboardFileText');
    // console.log(dashboardFileText);

    let getCatalogFilesRequest: apiToDisk.ToDiskGetCatalogFilesRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskGetCatalogFilesResponse>(
        {
          routingKey: helper.makeRoutingKeyToDisk({
            orgId: project.orgId,
            projectId: projectId
          }),
          message: getCatalogFilesRequest,
          checkIsOk: true
        }
      );

    // add dashboard file

    let fileName = `${newDashboardId}${common.FileExtensionEnum.Dashboard}`;

    let mdir = currentStruct.mproveDirValue;

    if (
      mdir.length > 2 &&
      mdir.substring(0, 2) === common.MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }

    let relativePath =
      [
        common.MPROVE_CONFIG_DIR_DOT,
        common.MPROVE_CONFIG_DIR_DOT_SLASH
      ].indexOf(currentStruct.mproveDirValue) > -1
        ? `${common.MPROVE_USERS_FOLDER}/${user.alias}/${fileName}`
        : `${mdir}/${common.MPROVE_USERS_FOLDER}/${user.alias}/${fileName}`;

    let fileNodeId = `${projectId}/${relativePath}`;

    let pathString = JSON.stringify(fileNodeId.split('/'));

    let fileId = common.MyRegex.replaceSlashesWithUnderscores(relativePath);

    let tempFile: common.DiskCatalogFile = {
      projectId: projectId,
      repoId: repoId,
      fileId: fileId,
      pathString: pathString,
      fileNodeId: fileNodeId,
      name: fileName,
      content: dashboardFileText
    };

    let diskFiles = [
      tempFile,
      ...diskResponse.payload.files.filter(x => {
        let ar = x.name.split('.');
        let ext = ar[ar.length - 1];
        let allow =
          [
            common.FileExtensionEnum.Chart,
            common.FileExtensionEnum.Dashboard
          ].indexOf(`.${ext}` as common.FileExtensionEnum) < 0;
        return allow;
      })
    ];

    let { struct, dashboards, mconfigs, queries } =
      await this.blockmlService.rebuildStruct({
        traceId: traceId,
        orgId: project.orgId,
        projectId: projectId,
        structId: bridge.structId,
        diskFiles: diskFiles,
        mproveDir: diskResponse.payload.mproveDir,
        skipDb: true,
        envId: envId,
        overrideTimezone: timezone
      });

    // console.log('struct');
    // console.log(struct);

    let newDashboard = dashboards.find(x => x.dashboardId === newDashboardId);

    if (common.isUndefined(newDashboard)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CREATE_TEMP_DASHBOARD_FAIL,
        data: {
          structErrors: struct.errors
        }
      });
    }

    newDashboard.temp = true;
    newDashboard.creatorId = user.userId;

    let dashboardMconfigIds = newDashboard.tiles.map(x => x.mconfigId);
    let dashboardMconfigs = mconfigs.filter(
      x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
    );

    let dashboardQueryIds = newDashboard.tiles.map(x => x.queryId);
    let dashboardQueries = queries.filter(
      x => dashboardQueryIds.indexOf(x.queryId) > -1
    );

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                dashboards: [
                  this.wrapToEntService.wrapToEntityDashboard(newDashboard)
                ],
                mconfigs: dashboardMconfigs.map(x =>
                  this.wrapToEntService.wrapToEntityMconfig(x)
                )
              },
              insertOrDoNothing: {
                queries: dashboardQueries.map(x =>
                  this.wrapToEntService.wrapToEntityQuery(x)
                )
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    // await this.dbService.writeRecords({
    //   modify: false,
    //   records: {
    //     dashboards: [wrapper.wrapToEntityDashboard(newDashboard)],
    //     mconfigs: dashboardMconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
    //     queries: dashboardQueries.map(x => wrapper.wrapToEntityQuery(x))
    //   }
    // });

    let payload = {};

    return payload;
  }
}
