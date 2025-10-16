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
import { and, eq, inArray } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  MconfigTab,
  QueryTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeDashboardFileText } from '~backend/functions/make-dashboard-file-text';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { DashboardsService } from '~backend/services/db/dashboards.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MconfigsService } from '~backend/services/db/mconfigs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ModelsService } from '~backend/services/db/models.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { StructsService } from '~backend/services/db/structs.service';
import { TabService } from '~backend/services/tab.service';
import {
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_USERS_FOLDER,
  PROD_REPO_ID,
  UTC
} from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { QueryParentTypeEnum } from '~common/enums/query-parent-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { TileX } from '~common/interfaces/backend/tile-x';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import {
  ToBackendCreateDraftDashboardRequest,
  ToBackendCreateDraftDashboardResponsePayload
} from '~common/interfaces/to-backend/dashboards/to-backend-create-draft-dashboard';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateDraftDashboardController {
  constructor(
    private tabService: TabService,
    private branchesService: BranchesService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private dashboardsService: DashboardsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateDraftDashboard)
  async createDraftDashboard(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendCreateDraftDashboardRequest = request.body;

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
      timezone
    } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

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

    let fromDashboardX =
      await this.dashboardsService.getDashboardXCheckExistsAndAccess({
        dashboardId: oldDashboardId,
        structId: bridge.structId,
        apiUserMember: apiUserMember,
        projectId: projectId
      });

    let yTiles: TileX[] = [];

    tiles.forEach(freshTile => {
      let yTile = fromDashboardX.tiles.find(y => freshTile.title === y.title);

      // if (isDefined(yTile.malloyQueryId)) {
      //   yTile.malloyQueryId = makeId();
      // }

      yTile.plateX = freshTile.plateX;
      yTile.plateY = freshTile.plateY;
      yTile.plateWidth = freshTile.plateWidth;
      yTile.plateHeight = freshTile.plateHeight;

      yTile.listen = freshTile.listen;
      yTile.mconfig.filters = yTile.mconfig.filters.filter(
        k =>
          isUndefined(freshTile.deletedFilterFieldIds) ||
          freshTile.deletedFilterFieldIds.indexOf(k.fieldId) < 0
      );

      yTiles.push(yTile);
    });

    fromDashboardX.tiles = yTiles;
    fromDashboardX.fields = newDashboardFields;

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

    let fileName = `${newDashboardId}${FileExtensionEnum.Dashboard}`;

    let mdir = currentStruct.mproveConfig.mproveDirValue;

    if (
      mdir.length > 2 &&
      mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }

    let relativePath =
      currentStruct.mproveConfig.mproveDirValue === MPROVE_CONFIG_DIR_DOT_SLASH
        ? `${MPROVE_USERS_FOLDER}/${user.alias}/${fileName}`
        : `${mdir}/${MPROVE_USERS_FOLDER}/${user.alias}/${fileName}`;

    let fileNodeId = `${projectId}/${relativePath}`;

    let pathString = JSON.stringify(fileNodeId.split('/'));

    let fileId = encodeFilePath({ filePath: relativePath });

    // second

    // let secondFileName = `${newDashboardId}${FileExtensionEnum.Malloy}`;

    // let secondRelativePath =
    //   currentStruct.mproveConfig.mproveDirValue === MPROVE_CONFIG_DIR_DOT_SLASH
    //     ? `${MPROVE_USERS_FOLDER}/${user.alias}/${secondFileName}`
    //     : `${mdir}/${MPROVE_USERS_FOLDER}/${user.alias}/${secondFileName}`;

    // let secondFileNodeId = `${projectId}/${secondRelativePath}`;

    // let secondPathString = JSON.stringify(secondFileNodeId.split('/'));

    // let secondFileId = encodeFilePath({ filePath: secondRelativePath });

    let {
      dashboardFileText
      // , malloyFileText
    } = makeDashboardFileText({
      dashboard: fromDashboardX,
      newDashboardId: newDashboardId,
      newTitle: newDashboardId,
      roles: fromDashboardX.accessRoles.join(', '),
      caseSensitiveStringFilters:
        currentStruct.mproveConfig.caseSensitiveStringFilters,
      timezone: UTC
      // malloyDashboardFilePath: secondFileNodeId
    });

    // console.log('dashboardFileText');
    // console.log(dashboardFileText);

    // console.log('malloyFileText');
    // console.log(malloyFileText);

    // add dashboard file

    let tempFile: DiskCatalogFile = {
      projectId: projectId,
      repoId: repoId,
      fileId: fileId,
      pathString: pathString,
      fileNodeId: fileNodeId,
      name: fileName,
      content: dashboardFileText
    };

    // let secondTempFile: DiskCatalogFile = {
    //   projectId: projectId,
    //   repoId: repoId,
    //   fileId: secondFileId,
    //   pathString: secondPathString,
    //   fileNodeId: secondFileNodeId,
    //   name: secondFileName,
    //   content: malloyFileText
    // };

    let diskFiles = [
      tempFile
      // ...diskResponse.payload.files.filter(x => {
      //   let ar = x.name.split('.');
      //   let ext = ar[ar.length - 1];
      //   let allow =
      //     // x.fileNodeId !== secondFileNodeId &&
      //     [FileExtensionEnum.Yml].indexOf(`.${ext}` as FileExtensionEnum) > -1;
      //   return allow;
      // })
    ];

    // if (isDefined(malloyFileText)) {
    //   diskFiles.push(secondTempFile);
    // }

    let modelIds = (tiles ?? []).map(tile => tile.modelId);

    let cachedModels = await this.db.drizzle.query.modelsTable
      .findMany({
        where: and(
          eq(modelsTable.structId, bridge.structId),
          inArray(modelsTable.modelId, modelIds)
        )
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let {
      struct: apiStruct,
      dashboards: apiDashboards,
      mconfigs: apiMconfigs,
      models: apiModels,
      queries: apiQueries
    } = await this.blockmlService.rebuildStruct({
      traceId: traceId,
      projectId: projectId,
      structId: bridge.structId,
      diskFiles: diskFiles,
      mproveDir: currentStruct.mproveConfig.mproveDirValue,
      skipDb: true,
      envId: envId,
      overrideTimezone: timezone,
      isUseCache: true,
      cachedMproveConfig: currentStruct.mproveConfig,
      cachedModels: cachedModels,
      cachedMetrics: []
    });

    let newApiDashboard = apiDashboards.find(
      x => x.dashboardId === newDashboardId
    );

    if (isUndefined(newApiDashboard)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CREATE_DRAFT_DASHBOARD_FAILED,
        displayData: {
          structErrors: apiStruct.errors
        }
      });
    }

    newApiDashboard.draft = true;
    newApiDashboard.creatorId = user.userId;

    let dashboardMconfigIds = newApiDashboard.tiles.map(x => x.mconfigId);
    let dashboardMconfigs = apiMconfigs.filter(
      x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
    );

    let dashboardQueryIds = newApiDashboard.tiles.map(x => x.queryId);
    let dashboardQueries = apiQueries.filter(
      x => dashboardQueryIds.indexOf(x.queryId) > -1
    );

    let insertMconfigs: MconfigTab[] = [];
    let insertOrUpdateQueries: QueryTab[] = [];
    let insertOrDoNothingQueries: QueryTab[] = [];

    let dashboardMalloyMconfigs = dashboardMconfigs.filter(
      mconfig => mconfig.modelType === ModelTypeEnum.Malloy
    );

    dashboardMalloyMconfigs.forEach(apiMconfig => {
      let mconfig = this.mconfigsService.apiToTab({ apiMconfig: apiMconfig });

      insertMconfigs.push(mconfig);

      let apiQuery = dashboardQueries.find(
        y => y.queryId === apiMconfig.queryId
      );

      let query = this.queriesService.apiToTab({ apiQuery: apiQuery });

      insertOrDoNothingQueries.push(query);
    });

    let dashboardStoreMconfigs = dashboardMconfigs.filter(
      mconfig => mconfig.modelType === ModelTypeEnum.Store
    );

    await forEachSeries(dashboardStoreMconfigs, async apiMconfig => {
      let newMconfig: MconfigTab;
      let newQuery: QueryTab;
      let isError = false;

      let apiModel = apiModels.find(y => y.modelId === apiMconfig.modelId);

      let mqe = await this.mconfigsService.prepStoreMconfigQuery({
        struct: apiStruct,
        project: project,
        envId: envId,
        queryParentType: QueryParentTypeEnum.Dashboard,
        queryParentId: newDashboardId,
        model: this.modelsService.apiToTab({ apiModel: apiModel }),
        mconfig: this.mconfigsService.apiToTab({ apiMconfig: apiMconfig }),
        metricsStartDateYYYYMMDD: undefined,
        metricsEndDateYYYYMMDD: undefined
      });

      newMconfig = mqe.newMconfig;
      newQuery = mqe.newQuery;
      isError = mqe.isError;

      let newDashboardTile = newApiDashboard.tiles.find(
        tile => tile.mconfigId === apiMconfig.mconfigId
      );
      newDashboardTile.queryId = newMconfig.queryId;
      newDashboardTile.mconfigId = newMconfig.mconfigId;
      newDashboardTile.trackChangeId = makeId();

      insertMconfigs.push(newMconfig);

      if (isError === true) {
        insertOrUpdateQueries.push(newQuery);
      } else {
        insertOrDoNothingQueries.push(newQuery);
      }
    });

    let newDashboard = this.dashboardsService.apiToTab({
      apiDashboard: newApiDashboard
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                dashboards: [newDashboard],
                mconfigs: insertMconfigs
              },
              insertOrUpdate: {
                queries: insertOrUpdateQueries
              },
              insertOrDoNothing: {
                queries: insertOrDoNothingQueries
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let newDashboardParts = await this.dashboardsService.getDashboardParts({
      newDashboard: newDashboard,
      structId: bridge.structId,
      user: user,
      apiUserMember: apiUserMember
    });

    let newDashboardX =
      await this.dashboardsService.getDashboardXCheckExistsAndAccess({
        dashboardId: newDashboard.dashboardId,
        projectId: projectId,
        structId: bridge.structId,
        apiUserMember: apiUserMember
      });

    let payload: ToBackendCreateDraftDashboardResponsePayload = {
      newDashboardPart:
        newDashboardParts.length > 0 ? newDashboardParts[0] : undefined,
      dashboard: newDashboardX
    };

    return payload;
  }
}
