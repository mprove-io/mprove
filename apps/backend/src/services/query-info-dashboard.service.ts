import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BridgeTab,
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { makeDashboardFileText } from '#backend/functions/make-dashboard-file-text';
import { BlockmlService } from '#backend/services/blockml.service';
import { DashboardsService } from '#backend/services/db/dashboards.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { StructsService } from '#backend/services/db/structs.service';
import { TabService } from '#backend/services/tab.service';
import {
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_USERS_FOLDER,
  UTC
} from '#common/constants/top';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { makeCopy } from '#common/functions/make-copy';
import { ServerError } from '#common/models/server-error';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import type { ToBackendGetDashboardResponsePayload } from '#common/zod/to-backend/dashboards/to-backend-get-dashboard';

@Injectable()
export class QueryInfoDashboardService {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private dashboardsService: DashboardsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getDashboardData(item: {
    traceId: string;
    user: UserTab;
    userMember: MemberTab;
    project: ProjectTab;
    bridge: BridgeTab;
    projectId: string;
    repoId: string;
    envId: string;
    dashboardId: string;
    timezone: string;
    skipUi: boolean;
  }): Promise<ToBackendGetDashboardResponsePayload> {
    let {
      traceId,
      user,
      userMember,
      project,
      bridge,
      projectId,
      repoId,
      envId,
      dashboardId,
      timezone,
      skipUi
    } = item;

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let fromDashboardX =
      await this.dashboardsService.getDashboardXCheckExistsAndAccess({
        dashboardId: dashboardId,
        structId: bridge.structId,
        apiUserMember: apiUserMember,
        projectId: projectId,
        user: user
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

    let { dashboardFileText } = makeDashboardFileText({
      dashboard: fromDashboardX,
      newDashboardId: newDashboardId,
      newTitle: fromDashboardX.title,
      roles: fromDashboardX.accessRoles.join(', '),
      caseSensitiveStringFilters:
        currentStruct.mproveConfig.caseSensitiveStringFilters,
      timezone: UTC
    });

    let tempFile: DiskCatalogFile = {
      projectId: projectId,
      repoId: repoId,
      fileId: fileId,
      fileNodeId: fileNodeId,
      pathString: pathString,
      name: fileName,
      content: dashboardFileText
    };

    let diskFiles = [tempFile];

    let modelIds = [
      ...(fromDashboardX?.tiles ?? []).map(tile => tile.modelId),
      ...fromDashboardX.fields
        .filter(x => isDefined(x.storeModel))
        .map(x => x.storeModel)
    ];

    let cachedModels = await this.db.drizzle.query.modelsTable
      .findMany({
        where: and(
          eq(modelsTable.structId, bridge.structId),
          inArray(modelsTable.modelId, modelIds)
        )
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let {
      struct: tempStruct,
      dashboards: apiDashboards,
      mconfigs: apiMconfigs,
      models: apiModels,
      queries: apiQueries
    } = await this.blockmlService.rebuildStruct({
      traceId: traceId,
      orgId: project.orgId,
      projectId: projectId,
      repoId: repoId,
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
        message: ErEnum.BACKEND_GET_DASHBOARD_FAIL,
        displayData: {
          structErrors: tempStruct.errors
        }
      });
    }

    newApiDashboard.draft = fromDashboardX.draft;
    newApiDashboard.creatorId = fromDashboardX.creatorId;

    let {
      newDashboard,
      insertMconfigs,
      insertOrUpdateQueries,
      insertOrDoNothingQueries
    } = await this.dashboardsService.processDashboard({
      newApiDashboard: newApiDashboard,
      apiMconfigs: apiMconfigs,
      apiQueries: apiQueries,
      apiModels: apiModels,
      fromDashboardX: fromDashboardX,
      isQueryCache: false,
      cachedQueries: [],
      cachedMconfigs: [],
      envId: envId,
      newDashboardId: newDashboardId,
      tempStruct: tempStruct,
      project: project
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
          apiDashboard: newApiDashboard
        }),
        projectId: projectId,
        structId: bridge.structId,
        apiUserMember: apiUserMember
      });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let modelPartXs = await this.modelsService.getModelPartXs({
      structId: struct.structId,
      apiUserMember: apiUserMember
    });

    if (skipUi === false) {
      user.ui = user.ui || makeCopy(DEFAULT_SRV_UI);
      user.ui.timezone = timezone;

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  users: [user]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let payload: ToBackendGetDashboardResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({
        struct: struct,
        modelPartXs: modelPartXs
      }),
      userMember: apiUserMember,
      dashboard: newDashboardX
    };

    return payload;
  }
}
