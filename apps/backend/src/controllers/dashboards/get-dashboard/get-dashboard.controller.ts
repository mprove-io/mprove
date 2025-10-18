import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { ErEnum } from '~common/enums/er.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { MconfigParentTypeEnum } from '~common/enums/mconfig-parent-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import {
  ToBackendGetDashboardRequest,
  ToBackendGetDashboardResponsePayload
} from '~common/interfaces/to-backend/dashboards/to-backend-get-dashboard';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetDashboardController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private modelsService: ModelsService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private projectsService: ProjectsService,
    private dashboardsService: DashboardsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetDashboard)
  async getDashboard(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetDashboardRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, isRepoProd, branchId, envId, dashboardId, timezone } =
      reqValid.payload;

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
      repoId: isRepoProd === true ? PROD_REPO_ID : user.userId,
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

    //
    //
    //

    let fromDashboardX =
      await this.dashboardsService.getDashboardXCheckExistsAndAccess({
        dashboardId: dashboardId,
        structId: bridge.structId,
        apiUserMember: apiUserMember,
        projectId: projectId
      });

    let newDashboardId = fromDashboardX.dashboardId;

    let fileName = `${newDashboardId}${FileExtensionEnum.Dashboard}`;

    let mdir = currentStruct.mproveConfig.mproveDirValue;

    if (
      mdir.length > 2 &&
      mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }

    // let dashboardFile = diskResponse.payload.files.find(
    //   x =>
    //     x.name === `${fromDashboard.dashboardId}${FileExtensionEnum.Dashboard}`
    // );

    // let malloyFile = diskResponse.payload.files.find(
    //   x => x.name === `${fromDashboard.dashboardId}${FileExtensionEnum.Malloy}`
    // );

    let relativePath =
      fromDashboardX.draft === true
        ? currentStruct.mproveConfig.mproveDirValue ===
          MPROVE_CONFIG_DIR_DOT_SLASH
          ? `${MPROVE_USERS_FOLDER}/${user.alias}/${fileName}`
          : `${mdir}/${MPROVE_USERS_FOLDER}/${user.alias}/${fileName}`
        : fromDashboardX.filePath.split('/').slice(1).join('/');

    let fileId = encodeFilePath({ filePath: relativePath });
    let fileNodeId = `${projectId}/${relativePath}`;
    let pathString = JSON.stringify(fileNodeId.split('/'));

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
      newTitle: fromDashboardX.title,
      roles: fromDashboardX.accessRoles.join(', '),
      caseSensitiveStringFilters:
        currentStruct.mproveConfig.caseSensitiveStringFilters,
      timezone: UTC
      // malloyDashboardFilePath: secondFileNodeId
    });

    // console.log('fromDashboard?.filePath');
    // console.log(fromDashboard?.filePath);
    // DXYE72ODCP5LWPWH2EXQ/data/c1_postgres/dashboards/c1_d1.dashboard

    // console.log('dashboardFile?.fileId');
    // console.log(dashboardFile?.fileId);
    // data%2Fc1_postgres%2Fdashboards%2Fc1_d1_DOT_dashboard

    // console.log('dashboardFile?.pathString');
    // console.log(dashboardFile?.pathString);
    // ["DXYE72ODCP5LWPWH2EXQ","data","c1_postgres","dashboards","c1_d1.dashboard"]

    // console.log('dashboardFile?.fileNodeId');
    // console.log(dashboardFile?.fileNodeId);
    // DXYE72ODCP5LWPWH2EXQ/data/c1_postgres/dashboards/c1_d1.dashboard

    // add dashboard file

    let tempFile: DiskCatalogFile = {
      projectId: projectId,
      repoId: repoId,
      fileId: fileId,
      fileNodeId: fileNodeId,
      pathString: pathString,
      name: fileName,
      content: dashboardFileText
    };

    // let secondTempFile: DiskCatalogFile = {
    //   projectId: projectId,
    //   repoId: repoId,
    //   fileId: fromDashboard.draft === true ? secondFileId : malloyFile?.fileId,
    //   pathString:
    //     fromDashboard.draft === true
    //       ? secondPathString
    //       : malloyFile?.pathString,
    //   fileNodeId:
    //     fromDashboard.draft === true
    //       ? secondFileNodeId
    //       : malloyFile?.fileNodeId,
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

    let modelIds = (fromDashboardX?.tiles ?? []).map(tile => tile.modelId);

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

    let newDashboard = apiDashboards.find(
      x => x.dashboardId === newDashboardId
    );

    if (isUndefined(newDashboard)) {
      throw new ServerError({
        message: ErEnum.BACKEND_GET_DASHBOARD_FAIL,
        displayData: {
          structErrors: apiStruct.errors
        }
      });
    }

    newDashboard.draft = fromDashboardX.draft;
    newDashboard.creatorId = fromDashboardX.creatorId;

    let dashboardMconfigIds = newDashboard.tiles.map(x => x.mconfigId);
    let dashboardMconfigs = apiMconfigs.filter(
      x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
    );

    let dashboardQueryIds = newDashboard.tiles.map(x => x.queryId);
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

      if (apiMconfig.modelType === ModelTypeEnum.Store) {
        let mqe = await this.mconfigsService.prepStoreMconfigQuery({
          struct: apiStruct,
          project: project,
          envId: envId,
          mconfigParentType: MconfigParentTypeEnum.Dashboard,
          mconfigParentId: newDashboardId,
          model: this.modelsService.apiToTab({ apiModel: apiModel }),
          mconfig: this.mconfigsService.apiToTab({ apiMconfig: apiMconfig }),
          metricsStartDateYYYYMMDD: undefined,
          metricsEndDateYYYYMMDD: undefined
        });

        newMconfig = mqe.newMconfig;
        newQuery = mqe.newQuery;
        isError = mqe.isError;

        let newDashboardTile = newDashboard.tiles.find(
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
      }
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
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

    let newDashboardX =
      await this.dashboardsService.getDashboardXUsingDashboardTab({
        dashboard: this.dashboardsService.apiToTab({
          apiDashboard: newDashboard
        }),
        projectId: projectId,
        structId: bridge.structId,
        apiUserMember: apiUserMember
      });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let payload: ToBackendGetDashboardResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({ struct: struct }),
      userMember: apiUserMember,
      dashboard: newDashboardX
    };

    return payload;
  }
}
