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
import { MconfigEnt } from '~backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { QueryEnt } from '~backend/drizzle/postgres/schema/queries';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeDashboardFileText } from '~backend/functions/make-dashboard-file-text';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { EnvsService } from '~backend/services/envs.service';
import { MalloyService } from '~backend/services/malloy.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';
import {
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_USERS_FOLDER,
  PROD_REPO_ID,
  UTC
} from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { QueryOperationTypeEnum } from '~common/enums/query-operation-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { isUndefined } from '~common/functions/is-undefined';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Query } from '~common/interfaces/blockml/query';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import {
  ToBackendGetDashboardRequest,
  ToBackendGetDashboardResponsePayload
} from '~common/interfaces/to-backend/dashboards/to-backend-get-dashboard';
import {
  ToDiskGetCatalogFilesRequest,
  ToDiskGetCatalogFilesResponse
} from '~common/interfaces/to-disk/04-catalogs/to-disk-get-catalog-files';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetDashboardController {
  constructor(
    private membersService: MembersService,
    private malloyService: MalloyService,
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private projectsService: ProjectsService,
    private dashboardsService: DashboardsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private mconfigsService: MconfigsService,
    private wrapToApiService: WrapToApiService,
    private wrapToEntService: WrapToEntService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetDashboard)
  async getDashboard(@AttachUser() user: UserEnt, @Req() request: any) {
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

    let oldDashboardId = dashboardId;

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

    // fromDashboard.fields = newDashboardFields;

    let getCatalogFilesRequest: ToDiskGetCatalogFilesRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
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
      await this.rabbitService.sendToDisk<ToDiskGetCatalogFilesResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: getCatalogFilesRequest,
        checkIsOk: true
      });

    let newDashboardId = fromDashboard.dashboardId;

    let fileName = `${newDashboardId}${FileExtensionEnum.Dashboard}`;

    let mdir = currentStruct.mproveDirValue;

    if (
      mdir.length > 2 &&
      mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }

    let dashboardFile = diskResponse.payload.files.find(
      x =>
        x.name === `${fromDashboard.dashboardId}${FileExtensionEnum.Dashboard}`
    );

    let malloyFile = diskResponse.payload.files.find(
      x => x.name === `${fromDashboard.dashboardId}${FileExtensionEnum.Malloy}`
    );

    let relativePath =
      currentStruct.mproveDirValue === MPROVE_CONFIG_DIR_DOT_SLASH
        ? `${MPROVE_USERS_FOLDER}/${user.alias}/${fileName}`
        : `${mdir}/${MPROVE_USERS_FOLDER}/${user.alias}/${fileName}`;

    let fileNodeId = `${projectId}/${relativePath}`;

    let pathString = JSON.stringify(fileNodeId.split('/'));

    let fileId = encodeFilePath({ filePath: relativePath });

    // second

    let secondFileName = `${newDashboardId}${FileExtensionEnum.Malloy}`;

    let secondRelativePath =
      currentStruct.mproveDirValue === MPROVE_CONFIG_DIR_DOT_SLASH
        ? `${MPROVE_USERS_FOLDER}/${user.alias}/${secondFileName}`
        : `${mdir}/${MPROVE_USERS_FOLDER}/${user.alias}/${secondFileName}`;

    // let secondFileNodeId = `${projectId}/${secondRelativePath}`;

    // let secondPathString = JSON.stringify(secondFileNodeId.split('/'));

    // let secondFileId = encodeFilePath({ filePath: secondRelativePath });

    let {
      dashboardFileText
      // , malloyFileText
    } = makeDashboardFileText({
      dashboard: fromDashboard,
      newDashboardId: newDashboardId,
      newTitle: fromDashboard.title,
      roles: fromDashboard.accessRoles.join(', '),
      caseSensitiveStringFilters: currentStruct.caseSensitiveStringFilters,
      timezone: UTC
      // malloyDashboardFilePath: secondFileNodeId
    });

    // add dashboard file

    let tempFile: DiskCatalogFile = {
      projectId: projectId,
      repoId: repoId,
      fileId: fromDashboard.draft === true ? fileId : dashboardFile.fileId,
      pathString:
        fromDashboard.draft === true ? pathString : dashboardFile.pathString,
      fileNodeId:
        fromDashboard.draft === true ? fileNodeId : dashboardFile.fileNodeId,
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
      tempFile,
      ...diskResponse.payload.files.filter(x => {
        let ar = x.name.split('.');
        let ext = ar[ar.length - 1];
        let allow =
          // x.fileNodeId !== secondFileNodeId &&
          [FileExtensionEnum.Yml].indexOf(`.${ext}` as FileExtensionEnum) > -1;
        return allow;
      })
    ];

    // if (isDefined(malloyFileText)) {
    //   diskFiles.push(secondTempFile);
    // }

    let modelIds = fromDashboard.tiles.map(tile => tile.modelId);

    let cachedModels = await this.db.drizzle.query.modelsTable.findMany({
      where: and(
        eq(modelsTable.structId, bridge.structId),
        inArray(modelsTable.modelId, modelIds)
      )
    });

    let { struct, dashboards, mconfigs, models, queries } =
      await this.blockmlService.rebuildStruct({
        traceId: traceId,
        projectId: projectId,
        structId: bridge.structId,
        diskFiles: diskFiles,
        mproveDir: diskResponse.payload.mproveDir,
        skipDb: true,
        envId: envId,
        overrideTimezone: timezone,
        isUseCache: true,
        cachedModels: cachedModels,
        cachedMetrics: []
      });

    let newDashboard = dashboards.find(x => x.dashboardId === newDashboardId);

    if (isUndefined(newDashboard)) {
      throw new ServerError({
        message: ErEnum.BACKEND_GET_DASHBOARD_FAIL,
        data: {
          structErrors: struct.errors
        }
      });
    }

    newDashboard.draft = fromDashboard.draft;
    newDashboard.creatorId = fromDashboard.creatorId;

    let dashboardMconfigIds = newDashboard.tiles.map(x => x.mconfigId);
    let dashboardMconfigs = mconfigs.filter(
      x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
    );

    let dashboardQueryIds = newDashboard.tiles.map(x => x.queryId);
    let dashboardQueries = queries.filter(
      x => dashboardQueryIds.indexOf(x.queryId) > -1
    );

    let insertMconfigs: MconfigEnt[] = [];
    let insertOrUpdateQueries: QueryEnt[] = [];
    let insertOrDoNothingQueries: QueryEnt[] = [];

    dashboardMconfigs
      .filter(mconfig => mconfig.modelType !== ModelTypeEnum.Store)
      // .filter(mconfig => mconfig.isStoreModel === false)
      .forEach(mconfig => {
        let query = dashboardQueries.find(y => y.queryId === mconfig.queryId);

        insertMconfigs.push(this.wrapToEntService.wrapToEntityMconfig(mconfig));

        insertOrDoNothingQueries.push(
          this.wrapToEntService.wrapToEntityQuery(query)
        );
      });

    await forEachSeries(
      dashboardMconfigs.filter(
        mconfig =>
          mconfig.modelType === ModelTypeEnum.Store ||
          mconfig.modelType === ModelTypeEnum.Malloy
      ),
      async mconfig => {
        let newMconfig: Mconfig;
        let newQuery: Query;
        let isError = false;

        let model = models.find(y => y.modelId === mconfig.modelId);

        if (mconfig.modelType === ModelTypeEnum.Store) {
          let mqe = await this.mconfigsService.prepStoreMconfigQuery({
            struct: struct,
            project: project,
            envId: envId,
            model: this.wrapToEntService.wrapToEntityModel(model),
            mconfig: mconfig,
            metricsStartDateYYYYMMDD: undefined,
            metricsEndDateYYYYMMDD: undefined
          });

          newMconfig = mqe.newMconfig;
          newQuery = mqe.newQuery;
          isError = mqe.isError;
        } else if (mconfig.modelType === ModelTypeEnum.Malloy) {
          let editMalloyQueryResult = await this.malloyService.editMalloyQuery({
            projectId: projectId,
            envId: envId,
            structId: struct.structId,
            model: model,
            mconfig: mconfig,
            queryOperations: [
              {
                type: QueryOperationTypeEnum.Get,
                timezone: timezone
              }
            ]
          });

          newMconfig = editMalloyQueryResult.newMconfig;
          newQuery = editMalloyQueryResult.newQuery;
          isError = editMalloyQueryResult.isError;
        }

        let newDashboardTile = newDashboard.tiles.find(
          tile => tile.mconfigId === mconfig.mconfigId
        );
        newDashboardTile.queryId = newMconfig.queryId;
        newDashboardTile.mconfigId = newMconfig.mconfigId;

        newDashboardTile.trackChangeId = newMconfig.mconfigId;

        insertMconfigs.push(
          this.wrapToEntService.wrapToEntityMconfig(newMconfig)
        );

        if (isError === true) {
          insertOrUpdateQueries.push(
            this.wrapToEntService.wrapToEntityQuery(newQuery)
          );
        } else {
          insertOrDoNothingQueries.push(
            this.wrapToEntService.wrapToEntityQuery(newQuery)
          );
        }
      }
    );

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

    //
    //
    //

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let newDashboardX = await this.dashboardsService.getDashboardXCheckAccess({
      user: user,
      member: userMember,
      dashboard: this.wrapToEntService.wrapToEntityDashboard(newDashboard),
      bridge: bridge,
      projectId: projectId
    });

    let payload: ToBackendGetDashboardResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      userMember: apiMember,
      dashboard: newDashboardX
    };

    return payload;
  }
}
